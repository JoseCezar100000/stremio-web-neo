import React, { ChangeEvent, useCallback, useState } from 'react';
import Icon from '@stremio/stremio-icons/react';
import { useTranslation } from 'react-i18next';
import { Button, TextInput } from 'stremio/components';
import styles from './AddProfileItem.less';

type Props = {
    onCancel: () => void;
    onAdd: (name: string) => void | Promise<void>;
};

const AddProfileItem = ({ onCancel, onAdd }: Props) => {
    const { t } = useTranslation();
    const [inputValue, setInputValue] = useState('');

    const onChange = useCallback(({ target }: ChangeEvent<HTMLInputElement>) => {
        setInputValue(target.value);
    }, []);

    const onSubmit = useCallback(() => {
        onAdd(inputValue);
    }, [onAdd, inputValue]);

    return (
        <div className={styles['add-item']}>
            <TextInput
                className={styles['input']}
                value={inputValue}
                onChange={onChange}
                onSubmit={onSubmit}
                placeholder={t('SETTINGS_PROFILES_NAME_PLACEHOLDER')}
            />
            <div className={styles['actions']}>
                <Button className={styles['add']} onClick={onSubmit}>
                    <Icon name={'checkmark'} className={styles['icon']} />
                </Button>
                <Button className={styles['cancel']} onClick={onCancel}>
                    <Icon name={'close'} className={styles['icon']} />
                </Button>
            </div>
        </div>
    );
};

export default AddProfileItem;


