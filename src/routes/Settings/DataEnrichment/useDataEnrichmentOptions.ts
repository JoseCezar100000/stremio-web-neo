import { useState, useEffect, useMemo, useCallback } from 'react';
import { useServices } from 'stremio/services';
import { getTMDBApiKey, setTMDBApiKey } from 'stremio/common/tmdbApi';

type Props = {
    profile: Profile,
};

const useDataEnrichmentOptions = ({ profile }: Props) => {
    const { core } = useServices();
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

    const onShowTmdbCastToggle = useCallback(() => {
        const currentValue = profile.settings.showTmdbCast ?? true;
        core.transport.dispatch({
            action: 'Ctx',
            args: {
                action: 'UpdateSettings',
                args: {
                    ...profile.settings,
                    showTmdbCast: !currentValue,
                }
            }
        });
    }, [profile.settings, core]);

    const onShowPosterRatingsToggle = useCallback(() => {
        const currentValue = profile.settings.showPosterRatings ?? true;
        core.transport.dispatch({
            action: 'Ctx',
            args: {
                action: 'UpdateSettings',
                args: {
                    ...profile.settings,
                    showPosterRatings: !currentValue,
                }
            }
        });
    }, [profile.settings, core]);

    const showTmdbCastToggle = useMemo(() => ({
        checked: profile.settings.showTmdbCast ?? true,
        onClick: onShowTmdbCastToggle,
    }), [profile.settings.showTmdbCast, onShowTmdbCastToggle]);

    const showPosterRatingsToggle = useMemo(() => ({
        checked: profile.settings.showPosterRatings ?? true,
        onClick: onShowPosterRatingsToggle,
    }), [profile.settings.showPosterRatings, onShowPosterRatingsToggle]);

    return {
        apiKeyInput,
        showTmdbCastToggle,
        showPosterRatingsToggle,
    };
};

export default useDataEnrichmentOptions;

