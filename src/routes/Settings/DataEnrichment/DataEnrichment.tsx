import React, { forwardRef } from 'react';
import { TextInput, Toggle } from 'stremio/components';
import { Section, Category, Option } from '../components';
import useDataEnrichmentOptions from './useDataEnrichmentOptions';
import styles from './DataEnrichment.less';

type Props = {
    profile: Profile,
};

const DataEnrichment = forwardRef<HTMLDivElement, Props>(({ profile }: Props, ref) => {
    const {
        apiKeyInput,
        showTmdbCastToggle,
        showPosterRatingsToggle,
    } = useDataEnrichmentOptions({ profile });

    return (
        <Section ref={ref} label={'SETTINGS_NAV_DATA_ENRICHMENT'}>
            <Category icon={'image'} label={'SETTINGS_SECTION_TMDB'}>
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
                <Option label={'SETTINGS_DATA_ENRICHMENT_SHOW_CAST'}>
                    <Toggle
                        tabIndex={-1}
                        {...showTmdbCastToggle}
                    />
                </Option>
            </Category>
            <Category icon={'star'} label={'SETTINGS_SECTION_RATING'}>
                <Option label={'SETTINGS_DATA_ENRICHMENT_SHOW_POSTER_RATINGS'}>
                    <Toggle
                        tabIndex={-1}
                        {...showPosterRatingsToggle}
                    />
                </Option>
            </Category>
        </Section>
    );
});

export default DataEnrichment;

