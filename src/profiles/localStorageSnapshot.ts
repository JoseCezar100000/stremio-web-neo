import type { LocalProfileSnapshot } from './types';
import { ACTIVE_PROFILE_ID_STORAGE_KEY, PROFILES_STORAGE_KEY } from './constants';

const isProfilesKey = (key: string) =>
    key === PROFILES_STORAGE_KEY || key === ACTIVE_PROFILE_ID_STORAGE_KEY;

export const captureLocalStorageSnapshot = (): LocalProfileSnapshot => {
    const snapshot: LocalProfileSnapshot = {};
    try {
        for (let i = 0; i < window.localStorage.length; i += 1) {
            const key = window.localStorage.key(i);
            if (!key || isProfilesKey(key)) continue;
            const value = window.localStorage.getItem(key);
            if (value !== null) {
                snapshot[key] = value;
            }
        }
    } catch {
        return {};
    }
    return snapshot;
};

export const clearLocalStorageExceptProfilesKeys = () => {
    const keysToRemove: string[] = [];
    try {
        for (let i = 0; i < window.localStorage.length; i += 1) {
            const key = window.localStorage.key(i);
            if (!key || isProfilesKey(key)) continue;
            keysToRemove.push(key);
        }
        keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    } catch {
        // ignore
    }
};

export const restoreLocalStorageSnapshot = (snapshot: LocalProfileSnapshot) => {
    try {
        clearLocalStorageExceptProfilesKeys();
        Object.entries(snapshot).forEach(([k, v]) => {
            if (isProfilesKey(k)) return;
            try {
                window.localStorage.setItem(k, v);
            } catch {
                // ignore
            }
        });
    } catch {
        // ignore
    }
};


