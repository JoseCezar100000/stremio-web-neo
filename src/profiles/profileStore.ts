import { ACTIVE_PROFILE_ID_STORAGE_KEY, MAX_PROFILES, PROFILES_STORAGE_KEY } from './constants';
import type { LocalProfile } from './types';

const safeParse = <T>(value: string | null): T | null => {
    if (!value) return null;
    try {
        return JSON.parse(value) as T;
    } catch {
        return null;
    }
};

const now = () => Date.now();

export const getProfiles = (): LocalProfile[] => {
    const parsed = safeParse<LocalProfile[]>(window.localStorage.getItem(PROFILES_STORAGE_KEY));
    return Array.isArray(parsed) ? parsed : [];
};

export const setProfiles = (profiles: LocalProfile[]) => {
    window.localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(profiles.slice(0, MAX_PROFILES)));
};

export const getActiveProfileId = (): string | null => {
    const id = window.localStorage.getItem(ACTIVE_PROFILE_ID_STORAGE_KEY);
    return typeof id === 'string' && id.length ? id : null;
};

export const setActiveProfileId = (profileId: string) => {
    window.localStorage.setItem(ACTIVE_PROFILE_ID_STORAGE_KEY, profileId);
};

export const clearActiveProfileId = () => {
    window.localStorage.removeItem(ACTIVE_PROFILE_ID_STORAGE_KEY);
};

export const getActiveLocalProfile = (): LocalProfile | null => {
    const id = getActiveProfileId();
    if (!id) return null;
    return getProfiles().find((p) => p.id === id) || null;
};

const createId = (): string => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `p_${Math.random().toString(16).slice(2)}_${now()}`;
};

export const ensureAdminProfileExists = (): { profiles: LocalProfile[]; activeProfileId: string } => {
    const current = getProfiles();
    const active = getActiveProfileId();

    if (current.length > 0) {
        // Migration: don't force the admin profile name to be "Admin"
        // (role is admin, name should be user-defined)
        const migrated = current.map((p, idx) => (
            p.isAdmin && p.name === 'Admin' && p.nameCustomized === false ?
                { ...p, name: idx === 0 ? 'Profile 1' : p.name } :
                p
        ));
        if (JSON.stringify(migrated) !== JSON.stringify(current)) {
            setProfiles(migrated);
        }
        const nextActive = active && current.some((p) => p.id === active) ? active : current[0]!.id;
        if (nextActive !== active) {
            setActiveProfileId(nextActive);
        }
        return { profiles: migrated, activeProfileId: nextActive };
    }

    const admin: LocalProfile = {
        id: createId(),
        name: 'Profile 1',
        isAdmin: true,
        createdAt: now(),
        nameCustomized: false,
    };
    setProfiles([admin]);
    setActiveProfileId(admin.id);
    return { profiles: [admin], activeProfileId: admin.id };
};

export const addProfile = (name: string): LocalProfile | null => {
    const current = getProfiles();
    if (current.length >= MAX_PROFILES) return null;
    const profile: LocalProfile = {
        id: createId(),
        name: name.trim() || `Profile ${current.length + 1}`,
        isAdmin: false,
        createdAt: now(),
        nameCustomized: true,
    };
    const next = [...current, profile];
    setProfiles(next);
    return profile;
};

export const renameProfile = (profileId: string, name: string) => {
    setProfileName(profileId, name, true);
};

export const setProfileName = (profileId: string, name: string, nameCustomized: boolean) => {
    const nextName = name.trim();
    if (!nextName) return;
    const next = getProfiles().map((p) => (
        p.id === profileId ?
            { ...p, name: nextName, nameCustomized } :
            p
    ));
    setProfiles(next);
};

export const deleteProfile = (profileId: string) => {
    const current = getProfiles();
    const target = current.find((p) => p.id === profileId);
    if (!target || target.isAdmin) return;
    const next = current.filter((p) => p.id !== profileId);
    setProfiles(next);

    const active = getActiveProfileId();
    if (active === profileId) {
        if (next[0]?.id) {
            setActiveProfileId(next[0].id);
        } else {
            clearActiveProfileId();
        }
    }
};


