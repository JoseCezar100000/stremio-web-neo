import { PROFILES_DB_NAME, PROFILES_DB_SNAPSHOTS_STORE, PROFILES_DB_VERSION } from './constants';
import type { LocalProfileSnapshot } from './types';

const openDb = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(PROFILES_DB_NAME, PROFILES_DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(PROFILES_DB_SNAPSHOTS_STORE)) {
                db.createObjectStore(PROFILES_DB_SNAPSHOTS_STORE);
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
    });
};

export const getSnapshot = async (profileId: string): Promise<LocalProfileSnapshot | null> => {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
        const tx = db.transaction(PROFILES_DB_SNAPSHOTS_STORE, 'readonly');
        const store = tx.objectStore(PROFILES_DB_SNAPSHOTS_STORE);
        const req = store.get(profileId);
        req.onsuccess = () => resolve((req.result as LocalProfileSnapshot) || null);
        req.onerror = () => reject(req.error || new Error('Failed to read snapshot'));
    });
};

export const setSnapshot = async (profileId: string, snapshot: LocalProfileSnapshot): Promise<void> => {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
        const tx = db.transaction(PROFILES_DB_SNAPSHOTS_STORE, 'readwrite');
        const store = tx.objectStore(PROFILES_DB_SNAPSHOTS_STORE);
        const req = store.put(snapshot, profileId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error || new Error('Failed to save snapshot'));
    });
};

export const deleteSnapshot = async (profileId: string): Promise<void> => {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
        const tx = db.transaction(PROFILES_DB_SNAPSHOTS_STORE, 'readwrite');
        const store = tx.objectStore(PROFILES_DB_SNAPSHOTS_STORE);
        const req = store.delete(profileId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error || new Error('Failed to delete snapshot'));
    });
};


