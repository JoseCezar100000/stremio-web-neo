export { ProfileGate } from './ProfileGate';
export { ProfilesRuntime } from './ProfilesRuntime';

export {
    getProfiles,
    getActiveProfileId,
    getActiveLocalProfile,
    addProfile,
    renameProfile,
    setProfileName,
} from './profileStore';

export {
    ensureProfilesInitialized,
    persistActiveProfileSnapshot,
    switchToProfile,
    deleteProfileAndSnapshot,
} from './switchProfile';

export type { LocalProfile, LocalProfileSnapshot } from './types';


