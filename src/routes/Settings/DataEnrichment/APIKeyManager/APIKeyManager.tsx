// Copyright (C) 2017-2024 Smart code 203358507

import React, { useCallback, useEffect, useState } from 'react';
import styles from './APIKeyManager.less';
import AddKeyItem from './AddKeyItem';
import { getTMDBApiKey, setTMDBApiKey } from 'stremio/common/tmdbApi';

type Props = {
    onKeySavedChange?: (key: string) => void;
};

const APIKeyManager = ({ onKeySavedChange }: Props) => {
    const [draft, setDraft] = useState('');

    useEffect(() => {
        const current = getTMDBApiKey() || '';
        setDraft(current);
    }, []);

    useEffect(() => {
        const onChange = () => {
            const current = getTMDBApiKey() || '';
            setDraft(current);
        };
        window.addEventListener('storage', onChange);
        return () => window.removeEventListener('storage', onChange);
    }, []);

    const onSubmit = useCallback(() => {
        const next = draft.trim();
        setTMDBApiKey(next);
        onKeySavedChange?.(next);
    }, [draft, onKeySavedChange]);

    const onClear = useCallback(() => {
        setTMDBApiKey('');
        setDraft('');
        onKeySavedChange?.('');
    }, [onKeySavedChange]);

    return (
        <div className={styles['wrapper']}>
            <div className={styles['content']}>
                <AddKeyItem value={draft} onChange={setDraft} onSubmit={onSubmit} onClear={onClear} />
            </div>
        </div>
    );
};

export default APIKeyManager;

