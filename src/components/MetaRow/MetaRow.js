// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const ReactIs = require('react-is');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const { default: Icon } = require('@stremio/stremio-icons/react');
const { Button, HorizontalScroll } = require('stremio/components');
const CONSTANTS = require('stremio/common/CONSTANTS');
const useTranslate = require('stremio/common/useTranslate');
const MetaRowPlaceholder = require('./MetaRowPlaceholder');
const styles = require('./styles');

const MetaRow = ({ className, title, catalog, message, itemComponent, notifications, previewSize }) => {
    const t = useTranslate();

    const catalogTitle = React.useMemo(() => {
        return title ?? t.catalogTitle(catalog);
    }, [title, catalog, t.catalogTitle]);

    const items = React.useMemo(() => {
        const catalogItems = catalog?.items ?? catalog?.content?.content;
        return Array.isArray(catalogItems) ? catalogItems : [];
    }, [catalog]);

    const href = React.useMemo(() => {
        return catalog?.deepLinks?.discover ?? catalog?.deepLinks?.library;
    }, [catalog]);

    const size = React.useMemo(() => {
        return previewSize ?? CONSTANTS.CATALOG_PREVIEW_SIZE;
    }, [previewSize]);

    return (
        <div className={classnames(className, styles['meta-row-container'])}>
            <div className={styles['header-container']}>
                {
                    typeof catalogTitle === 'string' && catalogTitle.length > 0 ?
                        <div className={styles['title-container']} title={catalogTitle}>{catalogTitle}</div>
                        :
                        null
                }
                {
                    href ?
                        <Button className={styles['see-all-container']} title={t.string('BUTTON_SEE_ALL')} href={href} tabIndex={-1}>
                            <div className={styles['label']}>{ t.string('BUTTON_SEE_ALL') }</div>
                            <Icon className={styles['icon']} name={'chevron-forward'} />
                        </Button>
                        :
                        null
                }
            </div>
            {
                typeof message === 'string' && message.length > 0 ?
                    <div className={styles['message-container']} title={message}>{message}</div>
                    :
                    <HorizontalScroll className={styles['meta-items-scroll']}>
                        <div className={styles['meta-items-container']}>
                            {
                                ReactIs.isValidElementType(itemComponent) ?
                                    items.slice(0, size).map((item, index) => {
                                        const posterShape = item.posterShape || 'poster';
                                        return React.createElement(itemComponent, {
                                            ...item,
                                            key: index,
                                            className: classnames(styles['meta-item'], styles[`poster-shape-${posterShape}`]),
                                            notifications,
                                        });
                                    })
                                    :
                                    null
                            }
                        </div>
                    </HorizontalScroll>
            }
        </div>
    );
};

MetaRow.Placeholder = MetaRowPlaceholder;

MetaRow.propTypes = {
    className: PropTypes.string,
    title: PropTypes.string,
    message: PropTypes.string,
    catalog: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        type: PropTypes.string,
        addon: PropTypes.shape({
            manifest: PropTypes.shape({
                id: PropTypes.string,
                name: PropTypes.string,
            }),
        }),
        content: PropTypes.shape({
            content: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.arrayOf(PropTypes.shape({
                    posterShape: PropTypes.string,
                })),
            ]),
        }),
        items: PropTypes.arrayOf(PropTypes.shape({
            posterShape: PropTypes.string,
        })),
        deepLinks: PropTypes.shape({
            discover: PropTypes.string,
            library: PropTypes.string,
        }),
    }),
    itemComponent: PropTypes.elementType,
    notifications: PropTypes.object,
    previewSize: PropTypes.number,
};

module.exports = MetaRow;
