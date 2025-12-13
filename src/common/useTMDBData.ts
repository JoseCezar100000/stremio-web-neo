import { useState, useEffect, useMemo } from 'react';
import { extractIMDbId } from './extractIMDbId';
import { getTMDBData, getTMDBApiKey } from './tmdbApi';
import type { TMDBData } from './tmdbTypes';

type UseTMDBDataResult = {
    data: TMDBData | null;
    loading: boolean;
    error: string | null;
};

const cache = new Map<string, { data: TMDBData; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000;

const getCachedData = (key: string): TMDBData | null => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    return null;
};

const setCachedData = (key: string, data: TMDBData): void => {
    cache.set(key, { data, timestamp: Date.now() });
};

export const useTMDBData = (metaItem: any): UseTMDBDataResult => {
    const [data, setData] = useState<TMDBData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const imdbId = useMemo(() => extractIMDbId(metaItem), [metaItem]);
    const apiKey = useMemo(() => getTMDBApiKey(), []);

    useEffect(() => {
        if (!imdbId || !apiKey) {
            setData(null);
            setLoading(false);
            setError(null);
            return;
        }

        const cached = getCachedData(imdbId);
        if (cached) {
            setData(cached);
            setLoading(false);
            setError(null);
            return;
        }

        setLoading(true);
        setError(null);

        const determineType = (): 'movie' | 'tv' => {
            if (metaItem?.type === 'series' || metaItem?.type === 'tv') {
                return 'tv';
            }
            return 'movie';
        };

        getTMDBData(imdbId, apiKey, determineType())
            .then((result) => {
                if (result) {
                    setCachedData(imdbId, result);
                    setData(result);
                } else {
                    setData(null);
                }
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message || 'Failed to fetch TMDB data');
                setLoading(false);
                setData(null);
            });
    }, [imdbId, apiKey, metaItem]);

    return { data, loading, error };
};

