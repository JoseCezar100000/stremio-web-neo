import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY_SHOW_TMDB_CAST = 'stremio_show_tmdb_cast';
const STORAGE_KEY_SHOW_POSTER_RATINGS = 'stremio_show_poster_ratings';
const EVENT_NAME = 'stremio-data-enrichment-prefs-changed';

const parseBool = (value: string | null, defaultValue: boolean): boolean => {
    if (value === null) return defaultValue;
    return value === 'true';
};

export const getShowTmdbCast = (): boolean => {
    try {
        return parseBool(window.localStorage.getItem(STORAGE_KEY_SHOW_TMDB_CAST), true);
    } catch {
        return true;
    }
};

export const setShowTmdbCast = (value: boolean): void => {
    try {
        window.localStorage.setItem(STORAGE_KEY_SHOW_TMDB_CAST, value ? 'true' : 'false');
    } catch {
        // ignore
    }
    window.dispatchEvent(new Event(EVENT_NAME));
};

export const getShowPosterRatings = (): boolean => {
    try {
        return parseBool(window.localStorage.getItem(STORAGE_KEY_SHOW_POSTER_RATINGS), true);
    } catch {
        return true;
    }
};

export const setShowPosterRatings = (value: boolean): void => {
    try {
        window.localStorage.setItem(STORAGE_KEY_SHOW_POSTER_RATINGS, value ? 'true' : 'false');
    } catch {
        // ignore
    }
    window.dispatchEvent(new Event(EVENT_NAME));
};

export const useDataEnrichmentPrefs = () => {
    const [version, setVersion] = useState(0);

    useEffect(() => {
        const onChange = () => setVersion((v) => v + 1);
        window.addEventListener('storage', onChange);
        window.addEventListener(EVENT_NAME, onChange);
        return () => {
            window.removeEventListener('storage', onChange);
            window.removeEventListener(EVENT_NAME, onChange);
        };
    }, []);

    const showTmdbCast = useMemo(() => getShowTmdbCast(), [version]);
    const showPosterRatings = useMemo(() => getShowPosterRatings(), [version]);

    const updateShowTmdbCast = useCallback((value: boolean) => setShowTmdbCast(value), []);
    const updateShowPosterRatings = useCallback((value: boolean) => setShowPosterRatings(value), []);

    return {
        showTmdbCast,
        showPosterRatings,
        setShowTmdbCast: updateShowTmdbCast,
        setShowPosterRatings: updateShowPosterRatings,
    };
};


