import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import useProfile from 'stremio/common/useProfile';
import { getActiveProfileId, getActiveLocalProfile, setProfileName } from './profileStore';
import { persistActiveProfileSnapshot } from './switchProfile';

const SAVE_DEBOUNCE_MS = 1500;
const PERIODIC_SAVE_MS = 30000;

export const ProfilesRuntime = () => {
    const coreProfile = useProfile();
    const saveTimerRef = useRef<number | null>(null);

    const email = useMemo(() => coreProfile?.auth?.user?.email || null, [coreProfile?.auth?.user?.email]);

    const scheduleSave = useCallback(() => {
        if (saveTimerRef.current !== null) {
            window.clearTimeout(saveTimerRef.current);
        }
        saveTimerRef.current = window.setTimeout(() => {
            persistActiveProfileSnapshot().catch(() => {});
        }, SAVE_DEBOUNCE_MS);
    }, []);

    useEffect(() => {
        // Periodic best-effort persistence (helps if the user never manually switches profiles)
        const interval = window.setInterval(() => {
            persistActiveProfileSnapshot().catch(() => {});
        }, PERIODIC_SAVE_MS);
        return () => window.clearInterval(interval);
    }, []);

    useEffect(() => {
        const onHashChange = () => scheduleSave();
        window.addEventListener('hashchange', onHashChange);
        return () => window.removeEventListener('hashchange', onHashChange);
    }, [scheduleSave]);

    useEffect(() => {
        const onVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                persistActiveProfileSnapshot().catch(() => {});
            }
        };
        document.addEventListener('visibilitychange', onVisibilityChange);
        return () => document.removeEventListener('visibilitychange', onVisibilityChange);
    }, []);

    useEffect(() => {
        // Auto-name the active local profile from the Stremio email (only if not manually customized)
        if (!email) return;
        const activeLocal = getActiveLocalProfile();
        const activeId = getActiveProfileId();
        if (!activeLocal || !activeId) return;
        if (activeLocal.nameCustomized) return;
        if (activeLocal.name === email) return;
        setProfileName(activeId, email, false);
    }, [email]);

    // Also persist shortly after auth changes (login/logout)
    useEffect(() => {
        scheduleSave();
    }, [coreProfile?.auth?.key, scheduleSave]);

    return null;
};

export default ProfilesRuntime;


