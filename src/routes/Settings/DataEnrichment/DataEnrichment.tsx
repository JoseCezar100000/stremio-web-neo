import React, { forwardRef } from 'react';
import { TextInput } from 'stremio/components';
import { Section, Option } from '../components';
import useDataEnrichmentOptions from './useDataEnrichmentOptions';
import styles from './DataEnrichment.less';

type Props = {
    profile: Profile,
};

const DataEnrichment = forwardRef<HTMLDivElement, Props>(({ profile }: Props, ref) => {
    const { apiKeyInput } = useDataEnrichmentOptions();

    return (
        <Section ref={ref} label={'SETTINGS_NAV_DATA_ENRICHMENT'}>
            <Option label={'SETTINGS_DATA_ENRICHMENT_TMDB_API_KEY'}>
                <div className={styles['api-key-container']}>
                    <TextInput
                        className={styles['api-key-input']}
                        value={apiKeyInput.value}
                        onChange={apiKeyInput.onChange}
                        placeholder={'Enter TMDB API Key'}
                        type={'password'}
                    />
                </div>
            </Option>
        </Section>
    );
});

export default DataEnrichment;

