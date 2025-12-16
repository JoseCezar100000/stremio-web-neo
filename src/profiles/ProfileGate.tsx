import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image } from 'stremio/components';
import { ensureProfilesInitialized, switchToProfile } from './switchProfile';
import { getActiveProfileId, getProfiles, setActiveProfileId } from './profileStore';
import { FORCE_PROFILE_GATE_ONCE_SESSION_KEY, SKIP_PROFILE_GATE_ONCE_SESSION_KEY } from './constants';
import type { LocalProfile } from './types';
import styles from './ProfileGate.less';

type Props = {
    children: React.ReactNode;
};

const isRootHash = (hash: string) => hash === '' || hash === '#' || hash === '#/';

export const ProfileGate = ({ children }: Props) => {
    const { t } = useTranslation();
    const [ready, setReady] = useState(false);
    const [profiles, setProfilesState] = useState<LocalProfile[]>([]);
    const [activeId, setActiveIdState] = useState<string | null>(null);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        let mounted = true;
        // If we just switched profiles and reloaded, don't show the selector again (prevents "double click")
        try {
            const force = window.sessionStorage.getItem(FORCE_PROFILE_GATE_ONCE_SESSION_KEY);
            if (force) {
                window.sessionStorage.removeItem(FORCE_PROFILE_GATE_ONCE_SESSION_KEY);
            } else {
                const skip = window.sessionStorage.getItem(SKIP_PROFILE_GATE_ONCE_SESSION_KEY);
                if (skip) {
                    window.sessionStorage.removeItem(SKIP_PROFILE_GATE_ONCE_SESSION_KEY);
                    setDismissed(true);
                }
            }
        } catch (e) {
            console.warn('ProfileGate session flags unavailable', e);
        }
        ensureProfilesInitialized()
            .catch(console.error)
            .finally(() => {
                if (!mounted) return;
                setProfilesState(getProfiles());
                setActiveIdState(getActiveProfileId());
                setReady(true);
            });
        return () => { mounted = false; };
    }, []);

    const shouldShowSelector = useMemo(() => {
        if (!ready || dismissed) return false;
        if (profiles.length <= 1) return false;
        // Only show on the very first screen (avoid breaking deep links)
        return isRootHash(window.location.hash);
    }, [ready, dismissed, profiles.length]);

    const onSelect = useCallback(async (profileId: string) => {
        if (profileId === activeId) {
            setActiveProfileId(profileId);
            setDismissed(true);
            return;
        }
        await switchToProfile(profileId);
    }, [activeId]);

    if (!ready) {
        // Keep it minimal - App has its own loader
        return null;
    }

    if (!shouldShowSelector) {
        return <>{children}</>;
    }

    const avatarUrl = require('/images/default_avatar.png');

    return (
        <div className={styles['gate']}>
            <div className={styles['background-container']} />
            <div className={styles['heading-container']}>
                <div className={styles['logo-container']}>
                    {React.createElement(Image as any, {
                        className: styles['logo'],
                        src: require('/images/logo.png'),
                        alt: ' ',
                        fallbackSrc: '',
                        renderFallback: () => null,
                        onError: () => {}
                    })}
                </div>
                <div className={styles['title-container']}>
                    {t('PROFILES_SELECT_TITLE')}
                </div>
            </div>
            <div className={styles['content']}>
                <div className={styles['grid']}>
                    {
                        profiles.map((p) => (
                            <button
                                key={p.id}
                                type={'button'}
                                className={styles['profile']}
                                onClick={() => onSelect(p.id)}
                            >
                                <div className={styles['avatar']} style={{ backgroundImage: `url('${avatarUrl}')` }} />
                                <div className={styles['name']} title={p.name}>{p.name}</div>
                            </button>
                        ))
                    }
                </div>
            </div>
        </div>
    );
};

export default ProfileGate;


