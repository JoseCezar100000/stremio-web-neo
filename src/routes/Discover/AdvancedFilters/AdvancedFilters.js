// Copyright (C) 2017-2025 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { default: Button } = require('stremio/components/Button');
const { default: Icon } = require('@stremio/stremio-icons/react');
const Multiselect = require('stremio/components/Multiselect');
const styles = require('./styles.less');

// Year options from 1970 to current year
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [
    { value: null, label: 'Any' },
    ...Array.from({ length: currentYear - 1969 }, (_, i) => ({
        value: String(currentYear - i),
        label: String(currentYear - i),
    })),
];

// Rating options
const RATING_OPTIONS = [
    { value: null, label: 'Any' },
    { value: '9', label: '9+' },
    { value: '8', label: '8+' },
    { value: '7', label: '7+' },
    { value: '6', label: '6+' },
    { value: '5', label: '5+' },
];

// Runtime options (in minutes)
const RUNTIME_OPTIONS = [
    { value: null, label: 'Any' },
    { value: '60', label: '< 1h' },
    { value: '90', label: '< 1.5h' },
    { value: '120', label: '< 2h' },
    { value: '180', label: '< 3h' },
];

const InlineMultiselect = ({ title, options, value, onChange }) => {
    const selected = React.useMemo(() => {
        return value !== null ? [String(value)] : [];
    }, [value]);

    const handleSelect = React.useCallback((event) => {
        const newValue = event.value === '' || event.value === null ? null : Number(event.value);
        onChange(newValue);
    }, [onChange]);

    return (
        <Multiselect
            className={styles['inline-multiselect']}
            direction="bottom-right"
            title={title}
            options={options}
            selected={selected}
            onSelect={handleSelect}
            renderLabelText={() => {
                if (value === null) {
                    return title;
                }
                const option = options.find(o => o.value === String(value));
                return option ? `${title} ${option.label}` : title;
            }}
        />
    );
};

InlineMultiselect.propTypes = {
    title: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired,
    value: PropTypes.number,
    onChange: PropTypes.func.isRequired,
};

const AdvancedFilters = ({ className, filters, updateFilter, clearFilters, hasActiveFilters, inline }) => {
    // Inline mode - render filters as Multiselect components in the filter bar
    if (inline) {
        return (
            <div className={classnames(className, styles['inline-filters-container'])}>
                <InlineMultiselect
                    title="Year From"
                    options={YEAR_OPTIONS}
                    value={filters.yearFrom}
                    onChange={(value) => updateFilter('yearFrom', value)}
                />
                <InlineMultiselect
                    title="Year To"
                    options={YEAR_OPTIONS}
                    value={filters.yearTo}
                    onChange={(value) => updateFilter('yearTo', value)}
                />
                <InlineMultiselect
                    title="Rating"
                    options={RATING_OPTIONS}
                    value={filters.ratingMin}
                    onChange={(value) => updateFilter('ratingMin', value)}
                />
                <InlineMultiselect
                    title="Runtime"
                    options={RUNTIME_OPTIONS}
                    value={filters.runtimeMax}
                    onChange={(value) => updateFilter('runtimeMax', value)}
                />
            </div>
        );
    }

    // Modal mode - full layout with headers
    return (
        <div className={classnames(className, styles['advanced-filters'])}>
            <div className={styles['filters-header']}>
                <span className={styles['section-title']}>Advanced Filters</span>
                {hasActiveFilters && (
                    <Button
                        className={styles['clear-button']}
                        title={'Clear all filters'}
                        onClick={clearFilters}
                    >
                        <Icon className={styles['clear-icon']} name={'close'} />
                        <span>Clear</span>
                    </Button>
                )}
            </div>

            <div className={styles['filters-grid']}>
                <Multiselect
                    className={styles['modal-multiselect']}
                    title="Year From"
                    options={YEAR_OPTIONS}
                    selected={filters.yearFrom !== null ? [String(filters.yearFrom)] : []}
                    onSelect={(e) => updateFilter('yearFrom', e.value === '' || e.value === null ? null : Number(e.value))}
                />
                <Multiselect
                    className={styles['modal-multiselect']}
                    title="Year To"
                    options={YEAR_OPTIONS}
                    selected={filters.yearTo !== null ? [String(filters.yearTo)] : []}
                    onSelect={(e) => updateFilter('yearTo', e.value === '' || e.value === null ? null : Number(e.value))}
                />
                <Multiselect
                    className={styles['modal-multiselect']}
                    title="Min Rating"
                    options={RATING_OPTIONS}
                    selected={filters.ratingMin !== null ? [String(filters.ratingMin)] : []}
                    onSelect={(e) => updateFilter('ratingMin', e.value === '' || e.value === null ? null : Number(e.value))}
                />
                <Multiselect
                    className={styles['modal-multiselect']}
                    title="Max Runtime"
                    options={RUNTIME_OPTIONS}
                    selected={filters.runtimeMax !== null ? [String(filters.runtimeMax)] : []}
                    onSelect={(e) => updateFilter('runtimeMax', e.value === '' || e.value === null ? null : Number(e.value))}
                />
            </div>
        </div>
    );
};

AdvancedFilters.propTypes = {
    className: PropTypes.string,
    filters: PropTypes.shape({
        yearFrom: PropTypes.number,
        yearTo: PropTypes.number,
        ratingMin: PropTypes.number,
        runtimeMax: PropTypes.number,
    }).isRequired,
    updateFilter: PropTypes.func.isRequired,
    clearFilters: PropTypes.func.isRequired,
    hasActiveFilters: PropTypes.bool.isRequired,
    inline: PropTypes.bool,
};

module.exports = AdvancedFilters;
