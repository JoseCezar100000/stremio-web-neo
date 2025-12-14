// Copyright (C) 2017-2025 Smart code 203358507

import { useCallback, useState, useEffect } from 'react';

const STORAGE_KEY = 'stremio_catalog_preferences';
const EVENT_NAME = 'stremio-catalog-preferences-changed';

type CatalogPreference = {
    enabled: boolean;
    order: number;
    showInHero?: boolean;
};

type CatalogPreferences = {
    [catalogId: string]: CatalogPreference;
};

type StoredPreferences = {
    heroSectionEnabled: boolean;
    catalogPreferences: CatalogPreferences;
    catalogOrder: string[];
};

const DEFAULT_PREFERENCES: StoredPreferences = {
    heroSectionEnabled: true,
    catalogPreferences: {},
    catalogOrder: [],
};

const getStoredPreferences = (): StoredPreferences => {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return {
                ...DEFAULT_PREFERENCES,
                ...parsed,
                catalogPreferences: {
                    ...DEFAULT_PREFERENCES.catalogPreferences,
                    ...parsed.catalogPreferences,
                },
            };
        }
    } catch (error) {
        console.error('Failed to load catalog preferences:', error);
    }
    return DEFAULT_PREFERENCES;
};

const savePreferences = (preferences: StoredPreferences): void => {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
        console.error('Failed to save catalog preferences:', error);
    }
    window.dispatchEvent(new Event(EVENT_NAME));
};

export const getCatalogId = (catalog: any): string | null => {
    if (catalog?.deepLinks?.discover) {
        return catalog.deepLinks.discover;
    }
    if (catalog?.addon?.manifest?.id && catalog?.id && catalog?.type) {
        return `${catalog.addon.manifest.id}_${catalog.id}_${catalog.type}`;
    }
    if (catalog?.name && catalog?.type) {
        return `${catalog.name}_${catalog.type}`;
    }
    return null;
};

const useCatalogPreferences = () => {
    const [preferences, setPreferences] = useState<StoredPreferences>(() => getStoredPreferences());

    useEffect(() => {
        const handleStorageChange = () => {
            setPreferences(getStoredPreferences());
        };
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener(EVENT_NAME, handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener(EVENT_NAME, handleStorageChange);
        };
    }, []);

    const updatePreferences = useCallback((updater: (prev: StoredPreferences) => StoredPreferences) => {
        setPreferences((prev) => {
            const updated = updater(prev);
            savePreferences(updated);
            return updated;
        });
    }, []);

    const getHeroSectionEnabled = useCallback((): boolean => {
        return preferences.heroSectionEnabled;
    }, [preferences.heroSectionEnabled]);

    const setHeroSectionEnabled = useCallback((enabled: boolean): void => {
        updatePreferences((prev) => ({
            ...prev,
            heroSectionEnabled: enabled,
        }));
    }, [updatePreferences]);

    const getCatalogPreference = useCallback((catalog: any): CatalogPreference | null => {
        const catalogId = getCatalogId(catalog);
        if (!catalogId) return null;
        return preferences.catalogPreferences[catalogId] || {
            enabled: true,
            order: -1,
            showInHero: undefined,
        };
    }, [preferences.catalogPreferences]);

    const setCatalogPreference = useCallback((catalog: any, preference: Partial<CatalogPreference>): void => {
        const catalogId = getCatalogId(catalog);
        if (!catalogId) return;

        updatePreferences((prev) => {
            const current = prev.catalogPreferences[catalogId] || {
                enabled: true,
                order: -1,
                showInHero: true,
            };

            return {
                ...prev,
                catalogPreferences: {
                    ...prev.catalogPreferences,
                    [catalogId]: {
                        ...current,
                        ...preference,
                    },
                },
            };
        });
    }, [updatePreferences]);

    const getCatalogOrder = useCallback((): string[] => {
        return preferences.catalogOrder;
    }, [preferences.catalogOrder]);

    const setCatalogOrder = useCallback((order: string[]): void => {
        updatePreferences((prev) => ({
            ...prev,
            catalogOrder: order,
        }));
    }, [updatePreferences]);

    const isCatalogEnabled = useCallback((catalog: any): boolean => {
        const pref = getCatalogPreference(catalog);
        return pref ? pref.enabled : true;
    }, [getCatalogPreference]);

    const shouldShowInHero = useCallback((catalog: any, index: number = -1): boolean => {
        const pref = getCatalogPreference(catalog);
        return pref?.showInHero ?? (index === 0);
    }, [getCatalogPreference]);

    return {
        preferences,
        getHeroSectionEnabled,
        setHeroSectionEnabled,
        getCatalogPreference,
        setCatalogPreference,
        getCatalogOrder,
        setCatalogOrder,
        isCatalogEnabled,
        shouldShowInHero,
    };
};

export default useCatalogPreferences;
export type { CatalogPreference, CatalogPreferences, StoredPreferences };

