import type { TMDBMovieDetails, TMDBTVDetails, TMDBData } from './tmdbTypes';

const STORAGE_KEY = 'stremio_tmdb_api_key';
const API_BASE_URL = 'https://api.themoviedb.org/3';

export const getTMDBApiKey = (): string | null => {
    try {
        return window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to get TMDB API key:', error);
        return null;
    }
};

export const setTMDBApiKey = (key: string): void => {
    try {
        window.localStorage.setItem(STORAGE_KEY, key);
    } catch (error) {
        console.error('Failed to set TMDB API key:', error);
    }
};

const extractMaturityRating = (data: TMDBMovieDetails | TMDBTVDetails): string | null => {
    if ('release_dates' in data && data.release_dates?.results) {
        const usRelease = data.release_dates.results.find(r => r.iso_3166_1 === 'US');
        if (usRelease && usRelease.release_dates && usRelease.release_dates.length > 0) {
            const certification = usRelease.release_dates[0].certification;
            if (certification) return certification;
        }
    }
    
    if ('content_ratings' in data && data.content_ratings?.results) {
        const usRating = data.content_ratings.results.find(r => r.iso_3166_1 === 'US');
        if (usRating?.rating) return usRating.rating;
    }
    
    return null;
};

const transformTMDBData = (data: TMDBMovieDetails | TMDBTVDetails): TMDBData => {
    return {
        cast: data.credits?.cast?.slice(0, 20) || [],
        maturityRating: extractMaturityRating(data),
        collection: 'belongs_to_collection' in data ? data.belongs_to_collection : null,
        similar: data.similar?.results || [],
        recommendations: data.recommendations?.results || [],
    };
};

export const getTMDBData = async (
    imdbId: string,
    apiKey: string,
    type: 'movie' | 'tv' = 'movie'
): Promise<TMDBData | null> => {
    if (!imdbId || !apiKey) {
        return null;
    }

    try {
        const url = `${API_BASE_URL}/${type}/${imdbId}?api_key=${apiKey}&append_to_response=credits,release_dates,similar,recommendations,collection&language=en-US`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
        }

        const data: TMDBMovieDetails | TMDBTVDetails = await response.json();
        return transformTMDBData(data);
    } catch (error) {
        console.error('Failed to fetch TMDB data:', error);
        return null;
    }
};

