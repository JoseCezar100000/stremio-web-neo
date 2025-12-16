import React, { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '@stremio/stremio-icons/react';
import { useTranslation } from 'react-i18next';
import { Button, TextInput } from 'stremio/components';
import { MAX_PROFILES } from 'stremio/profiles/constants';
import {
    addProfile,
    deleteProfileAndSnapshot,
    ensureProfilesInitialized,
    getActiveLocalProfile,
    getActiveProfileId,
    getProfiles,
    renameProfile,
} from 'stremio/profiles';
import AddProfileItem from './AddProfileItem';
import styles from './ProfilesManager.less';

const ProfilesManager = () => {
    const { t } = useTranslation();
    const [profiles, setProfilesState] = useState(getProfiles());
    const [activeId, setActiveIdState] = useState(getActiveProfileId());
    const [addMode, setAddMode] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draftName, setDraftName] = useState('');

    const isAdmin = useMemo(() => getActiveLocalProfile()?.isAdmin === true, [activeId]);

    useEffect(() => {
        const onStorage = () => {
            setProfilesState(getProfiles());
            setActiveIdState(getActiveProfileId());
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const canAdd = profiles.length < MAX_PROFILES;

    const onAdd = useCallback(() => {
        if (!canAdd) return;
        setAddMode(true);
    }, [canAdd]);

    const onCancel = useCallback(() => setAddMode(false), []);

    const handleAddProfile = useCallback(async (name: string) => {
        const created = addProfile(name);
        setAddMode(false);
        if (!created) return;
        try {
            // Ensure the new profile has at least an empty snapshot
            await ensureProfilesInitialized();
        } catch (e) {
            console.warn('Failed to initialize snapshot for new profile', e);
        }
        setProfilesState(getProfiles());
    }, []);

    const onDelete = useCallback((id: string) => {
        deleteProfileAndSnapshot(id)
            .catch(console.error)
            .finally(() => {
                setProfilesState(getProfiles());
                setActiveIdState(getActiveProfileId());
            });
    }, []);

    const onStartEdit = useCallback((id: string, name: string) => {
        setEditingId(id);
        setDraftName(name);
    }, []);

    const onEditChange = useCallback(({ target }: ChangeEvent<HTMLInputElement>) => {
        setDraftName(target.value);
    }, []);

    const onCancelEdit = useCallback(() => {
        setEditingId(null);
        setDraftName('');
    }, []);

    const onSubmitEdit = useCallback((id: string) => {
        renameProfile(id, draftName);
        setProfilesState(getProfiles());
        onCancelEdit();
    }, [draftName, onCancelEdit]);

    if (!isAdmin) {
        return null;
    }

    return (
        <div className={styles['wrapper']}>
            <div className={styles['header']}>
                <div className={styles['label']}>{t('SETTINGS_PROFILES_NAME')}</div>
                <div className={styles['label']}>{t('SETTINGS_PROFILES_ROLE')}</div>
            </div>
            <div className={styles['content']}>
                {
                    profiles.map((p) => (
                        <div key={p.id} className={styles['item']}>
                            <div className={styles['content-row']}>
                                {
                                    editingId === p.id ?
                                        <TextInput
                                            className={styles['edit-input']}
                                            value={draftName}
                                            onChange={onEditChange}
                                            onSubmit={() => onSubmitEdit(p.id)}
                                            placeholder={t('SETTINGS_PROFILES_NAME_PLACEHOLDER')}
                                        />
                                        :
                                        <button
                                            type={'button'}
                                            className={styles['name-button']}
                                            title={t('SETTINGS_PROFILES_RENAME')}
                                            onClick={() => onStartEdit(p.id, p.name)}
                                        >
                                            <div className={styles['name']} title={p.name}>{p.name}</div>
                                        </button>
                                }
                            </div>
                            <div className={styles['actions']}>
                                {
                                    editingId === p.id ?
                                        <div className={styles['edit-actions']}>
                                            <Button className={styles['edit-confirm']} onClick={() => onSubmitEdit(p.id)}>
                                                <Icon name={'checkmark'} className={styles['edit-icon']} />
                                            </Button>
                                            <Button className={styles['edit-cancel']} onClick={onCancelEdit}>
                                                <Icon name={'close'} className={styles['edit-icon']} />
                                            </Button>
                                        </div>
                                        :
                                        p.isAdmin ? (
                                            <div className={styles['role']}>
                                                <div className={styles['role-label']}>{t('SETTINGS_PROFILES_ADMIN')}</div>
                                            </div>
                                        ) : null
                                }
                                {
                                    !p.isAdmin && editingId !== p.id &&
                                        <Button className={styles['delete']} title={t('SETTINGS_PROFILES_DELETE')} onClick={() => onDelete(p.id)}>
                                            <Icon name={'bin'} className={styles['icon']} />
                                        </Button>
                                }
                            </div>
                        </div>
                    ))
                }
                { addMode ? <AddProfileItem onCancel={onCancel} onAdd={handleAddProfile} /> : null }
            </div>
            <div className={styles['footer']}>
                <Button className={styles['add-profile']} title={t('SETTINGS_PROFILES_ADD')} disabled={!canAdd} onClick={onAdd}>
                    <Icon name={'add'} className={styles['add-icon']} />
                    {t('SETTINGS_PROFILES_ADD')}
                </Button>
            </div>
        </div>
    );
};

export default ProfilesManager;


