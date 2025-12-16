// Copyright (C) 2017-2025 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { default: Button } = require('stremio/components/Button');
const { default: Icon } = require('@stremio/stremio-icons/react');
const styles = require('./styles.less');

// Year options from 1970 to current year
const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [
    { value: null, label: 'Any' },
    ...Array.from({ length: currentYear - 1969 }, (_, i) => ({
        value: currentYear - i,
        label: String(currentYear - i),
    })),
];

// Rating options
const RATING_OPTIONS = [
    { value: null, label: 'Any' },
    { value: 9, label: '9+ Excellent' },
    { value: 8, label: '8+ Great' },
    { value: 7, label: '7+ Good' },
    { value: 6, label: '6+ Fair' },
    { value: 5, label: '5+ Average' },
];

// Runtime options (in minutes)
const RUNTIME_OPTIONS = [
    { value: null, label: 'Any' },
    { value: 60, label: 'Under 1 hour' },
    { value: 90, label: 'Under 1.5 hours' },
    { value: 120, label: 'Under 2 hours' },
    { value: 180, label: 'Under 3 hours' },
];

const FilterSelect = ({ value, options, onChange, placeholder }) => {
    const handleChange = React.useCallback((event) => {
        const newValue = event.target.value === '' ? null : Number(event.target.value);
        onChange(newValue);
    }, [onChange]);

    return (
        <select
            className={styles['select-input']}
            value={value === null ? '' : value}
            onChange={handleChange}
        >
            {options.map((option) => (
                <option
                    key={option.value === null ? 'null' : option.value}
                    value={option.value === null ? '' : option.value}
                >
                    {option.label}
                </option>
            ))}
        </select>
    );
};

FilterSelect.propTypes = {
    value: PropTypes.number,
    options: PropTypes.arrayOf(PropTypes.shape({
        value: PropTypes.number,
        label: PropTypes.string.isRequired,
    })).isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
};

const AdvancedFilters = ({ className, filters, updateFilter, clearFilters, hasActiveFilters }) => {
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
                <div className={styles['filter-group']}>
                    <label className={styles['filter-label']}>Year Range</label>
                    <div className={styles['year-range']}>
                        <FilterSelect
                            value={filters.yearFrom}
                            options={YEAR_OPTIONS}
                            onChange={(value) => updateFilter('yearFrom', value)}
                        />
                        <span className={styles['range-separator']}>to</span>
                        <FilterSelect
                            value={filters.yearTo}
                            options={YEAR_OPTIONS}
                            onChange={(value) => updateFilter('yearTo', value)}
                        />
                    </div>
                </div>

                <div className={styles['filter-group']}>
                    <label className={styles['filter-label']}>Minimum Rating</label>
                    <FilterSelect
                        value={filters.ratingMin}
                        options={RATING_OPTIONS}
                        onChange={(value) => updateFilter('ratingMin', value)}
                    />
                </div>

                <div className={styles['filter-group']}>
                    <label className={styles['filter-label']}>Max Runtime</label>
                    <FilterSelect
                        value={filters.runtimeMax}
                        options={RUNTIME_OPTIONS}
                        onChange={(value) => updateFilter('runtimeMax', value)}
                    />
                </div>
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
};

module.exports = AdvancedFilters;
