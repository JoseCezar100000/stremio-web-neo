import { useState, useEffect, useMemo } from 'react';
import { getTMDBApiKey, setTMDBApiKey } from 'stremio/common/tmdbApi';

const useDataEnrichmentOptions = () => {
    const [apiKey, setApiKeyState] = useState(() => getTMDBApiKey() || '');

    useEffect(() => {
        const handleStorageChange = () => {
            setApiKeyState(getTMDBApiKey() || '');
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const apiKeyInput = useMemo(() => ({
        value: apiKey,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = e.target.value;
            setApiKeyState(newValue);
            setTMDBApiKey(newValue);
        }
    }), [apiKey]);

    return {
        apiKeyInput,
    };
};

export default useDataEnrichmentOptions;

