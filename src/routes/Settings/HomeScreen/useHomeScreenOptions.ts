// Copyright (C) 2017-2025 Smart code 203358507

import { useMemo, useCallback } from 'react';
import useCatalogPreferences, { getCatalogId } from 'stremio/common/useCatalogPreferences';

// @ts-ignore - CommonJS module
const useBoard = require('stremio/routes/Board/useBoard');

const useHomeScreenOptions = () => {
    const [board] = useBoard();
    const catalogPrefs = useCatalogPreferences();

    const catalogs = useMemo(() => {
        return board?.catalogs || [];
    }, [board?.catalogs]);

    const heroSectionEnabledToggle = useMemo(() => ({
        checked: catalogPrefs.getHeroSectionEnabled(),
        onClick: () => {
            catalogPrefs.setHeroSectionEnabled(!catalogPrefs.getHeroSectionEnabled());
        }
    }), [catalogPrefs]);

    const getCatalogToggle = useCallback((catalog: any) => {
        const pref = catalogPrefs.getCatalogPreference(catalog);
        return {
            checked: pref ? pref.enabled : true,
            onClick: () => {
                catalogPrefs.setCatalogPreference(catalog, {
                    enabled: !(pref ? pref.enabled : true),
                });
            }
        };
    }, [catalogPrefs]);

    const getCatalogHeroButton = useCallback((catalog: any) => {
        const pref = catalogPrefs.getCatalogPreference(catalog);
        // Default to first catalog only if preference is undefined
        const originalIndex = catalogs.indexOf(catalog);
        const isHeroEnabled = pref?.showInHero ?? (originalIndex === 0);
        const isCatalogEnabled = pref ? pref.enabled : true;
        
        return {
            checked: isHeroEnabled,
            disabled: !isCatalogEnabled,
            onClick: () => {
                if (!isCatalogEnabled) return;
                catalogPrefs.setCatalogPreference(catalog, {
                    showInHero: !isHeroEnabled,
                });
            }
        };
    }, [catalogPrefs, catalogs]);

    return {
        heroSectionEnabledToggle,
        getCatalogToggle,
        getCatalogHeroButton,
        reorderCatalogs: catalogPrefs,
        catalogs,
    };
};

export default useHomeScreenOptions;
