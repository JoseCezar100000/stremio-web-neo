import { useState, useEffect, useMemo, useCallback } from 'react';
import { useServices } from 'stremio/services';
import { getTMDBApiKey, setTMDBApiKey } from 'stremio/common/tmdbApi';
import { useDataEnrichmentPrefs } from 'stremio/common/dataEnrichmentPrefs';

type Props = {
    profile: Profile,
};

const useDataEnrichmentOptions = ({ profile }: Props) => {
    const { core } = useServices();
    const [apiKey, setApiKeyState] = useState(() => getTMDBApiKey() || '');
    const { showTmdbCast, showPosterRatings, showTmdbDescription, setShowTmdbCast, setShowPosterRatings, setShowTmdbDescription } = useDataEnrichmentPrefs();

    useEffect(() => {
        const handleStorageChange = () => {
            setApiKeyState(getTMDBApiKey() || '');
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const refreshApiKey = useCallback(() => {
        setApiKeyState(getTMDBApiKey() || '');
    }, []);

    const showTmdbCastToggle = useMemo(() => {
        const hasApiKey = apiKey && apiKey.trim().length > 0;
        return {
            checked: showTmdbCast,
            disabled: !hasApiKey,
            onClick: () => {
                if (hasApiKey) {
                    setShowTmdbCast(!showTmdbCast);
        core.transport.dispatch({
            action: 'Ctx',
            args: {
                action: 'UpdateSettings',
                args: {
                    ...profile.settings,
                                showTmdbCast: !showTmdbCast,
                }
            }
        });
                }
            }
        };
    }, [profile.settings, apiKey, showTmdbCast, setShowTmdbCast, core]);

    const showPosterRatingsToggle = useMemo(() => {
        return {
            checked: showPosterRatings,
            onClick: () => {
                setShowPosterRatings(!showPosterRatings);
        core.transport.dispatch({
            action: 'Ctx',
            args: {
                action: 'UpdateSettings',
                args: {
                    ...profile.settings,
                            showPosterRatings: !showPosterRatings,
                }
            }
        });
            }
        };
    }, [profile.settings, showPosterRatings, setShowPosterRatings, core]);

    const showTmdbDescriptionToggle = useMemo(() => {
        const hasApiKey = apiKey && apiKey.trim().length > 0;
        return {
            checked: showTmdbDescription,
            disabled: !hasApiKey,
            onClick: () => {
                if (hasApiKey) {
                    setShowTmdbDescription(!showTmdbDescription);
        core.transport.dispatch({
            action: 'Ctx',
            args: {
                action: 'UpdateSettings',
                args: {
                    ...profile.settings,
                                showTmdbDescription: !showTmdbDescription,
                }
            }
        });
                }
            }
        };
    }, [profile.settings, apiKey, showTmdbDescription, setShowTmdbDescription, core]);

    return {
        showTmdbCastToggle,
        showPosterRatingsToggle,
        showTmdbDescriptionToggle,
        refreshApiKey,
    };
};

export default useDataEnrichmentOptions;

