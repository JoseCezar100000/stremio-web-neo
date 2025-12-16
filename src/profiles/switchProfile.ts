import { captureLocalStorageSnapshot, restoreLocalStorageSnapshot } from './localStorageSnapshot';
import { deleteSnapshot, getSnapshot, setSnapshot } from './snapshotsDb';
import { deleteProfile, ensureAdminProfileExists, getActiveProfileId, getProfiles, setActiveProfileId } from './profileStore';
import { SKIP_PROFILE_GATE_ONCE_SESSION_KEY } from './constants';

export const persistActiveProfileSnapshot = async (): Promise<void> => {
    const activeId = getActiveProfileId();
    if (!activeId) return;
    const snapshot = captureLocalStorageSnapshot();
    await setSnapshot(activeId, snapshot);
};

export const switchToProfile = async (profileId: string): Promise<void> => {
    // Persist current active profile (best-effort)
    try {
        await persistActiveProfileSnapshot();
    } catch (e) {
        console.warn('Failed to persist current profile snapshot', e);
    }

    // Load target snapshot (or empty = logged out/guest)
    const nextSnapshot = (await getSnapshot(profileId)) || {};
    restoreLocalStorageSnapshot(nextSnapshot);
    setActiveProfileId(profileId);

    // Full reload so core boots with the restored persisted state
    try {
        window.sessionStorage.setItem(SKIP_PROFILE_GATE_ONCE_SESSION_KEY, '1');
    } catch (e) {
        console.warn('Failed to set skip gate flag', e);
    }
    window.location.reload();
};

export const deleteProfileAndSnapshot = async (profileId: string): Promise<void> => {
    const profiles = getProfiles();
    const target = profiles.find((p) => p.id === profileId);
    if (!target || target.isAdmin) return;
    deleteProfile(profileId);
    try {
        await deleteSnapshot(profileId);
    } catch (e) {
        console.warn('Failed to delete profile snapshot', e);
    }
};

export const ensureProfilesInitialized = async (): Promise<void> => {
    const { profiles, activeProfileId } = ensureAdminProfileExists();
    // If the active profile doesn't have a snapshot yet, seed it with current localStorage
    try {
        const existing = await getSnapshot(activeProfileId);
        if (!existing) {
            await setSnapshot(activeProfileId, captureLocalStorageSnapshot());
        }
    } catch (e) {
        console.warn('Failed to initialize profile snapshots', e);
    }

    // If metadata exists but snapshots got wiped, make sure every profile has at least an empty snapshot
    try {
        await Promise.all(profiles.map(async (p) => {
            const snap = await getSnapshot(p.id);
            if (!snap) {
                await setSnapshot(p.id, {});
            }
        }));
    } catch (e) {
        console.warn('Failed to backfill profile snapshots', e);
    }
};


