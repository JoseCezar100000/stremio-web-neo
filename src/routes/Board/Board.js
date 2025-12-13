// Copyright (C) 2017-2023 Smart code 203358507

const React = require('react');
const classnames = require('classnames');
const debounce = require('lodash.debounce');
const useTranslate = require('stremio/common/useTranslate');
const { useStreamingServer, useNotifications, withCoreSuspender, getVisibleChildrenRange, useProfile, useMetaDetailsForItems } = require('stremio/common');
const { ContinueWatchingItem, EventModal, MainNavBars, MetaItem, MetaRow } = require('stremio/components');
const useBoard = require('./useBoard');
const useContinueWatchingPreview = require('./useContinueWatchingPreview');
const styles = require('./styles');
const { default: StreamingServerWarning } = require('./StreamingServerWarning');
const HeroShelf = require('./HeroShelf');

const THRESHOLD = 5;

const Board = () => {
    const t = useTranslate();
    const streamingServer = useStreamingServer();
    const continueWatchingPreview = useContinueWatchingPreview();
    const [board, loadBoardRows] = useBoard();
    const notifications = useNotifications();
    const profile = useProfile();
    const boardCatalogsOffset = (continueWatchingPreview?.items?.length > 0 || (continueWatchingPreview?.content?.content && Array.isArray(continueWatchingPreview.content.content) && continueWatchingPreview.content.content.length > 0)) ? 1 : 0;
    const scrollContainerRef = React.useRef();
    const showStreamingServerWarning = React.useMemo(() => {
        return streamingServer.settings !== null && streamingServer.settings.type === 'Err' && (
            isNaN(profile.settings.streamingServerWarningDismissed.getTime()) ||
            profile.settings.streamingServerWarningDismissed.getTime() < Date.now());
    }, [profile.settings, streamingServer.settings]);
    const onVisibleRangeChange = React.useCallback(() => {
        const range = getVisibleChildrenRange(scrollContainerRef.current);
        if (range === null) {
            return;
        }

        const start = Math.max(0, range.start - boardCatalogsOffset - THRESHOLD);
        const end = range.end - boardCatalogsOffset + THRESHOLD;
        if (end < start) {
            return;
        }

        loadBoardRows({ start, end });
    }, [boardCatalogsOffset]);
    const onScroll = React.useCallback(debounce(onVisibleRangeChange, 250), [onVisibleRangeChange]);
    const heroItems = React.useMemo(() => {
        const items = [];
        board.catalogs.forEach((catalog) => {
            if (catalog.content?.type === 'Ready' && Array.isArray(catalog.content.content)) {
                catalog.content.content.forEach((item) => {
                    if (item && 
                        typeof item.background === 'string' && 
                        item.background.length > 0 &&
                        typeof item.logo === 'string' && 
                        item.logo.length > 0) {
                        items.push(item);
                    }
                });
            }
        });
        return items.slice(0, 10); // Limit to 10 items
    }, [board.catalogs]);

    const sourceItems = React.useMemo(() => {
        return continueWatchingPreview?.items ?? continueWatchingPreview?.content?.content ?? [];
    }, [continueWatchingPreview]);
    
    // Fetch meta details for first 4 items to get background and logo
    const { metaDataMap, isLoading: isLoadingMetaDetails } = useMetaDetailsForItems(sourceItems, 4);
    
    const continueWatchingCatalog = React.useMemo(() => {
        if (!continueWatchingPreview) {
            return continueWatchingPreview;
        }
        
        if (!Array.isArray(sourceItems) || sourceItems.length === 0) {
            return continueWatchingPreview;
        }
        
        const items = sourceItems.map((item) => {
            const itemKey = item._id || item.id;
            const metaData = metaDataMap.get(itemKey) || metaDataMap.get(item._id) || metaDataMap.get(item.id);
            
            const finalBackground = metaData?.background || item.background || item.backdrop || item.fanart || item?.behaviorHints?.background;
            const finalLogo = metaData?.logo || item.logo || item.logo_url || item?.behaviorHints?.logo;
            
            return {
                ...item,
                posterShape: 'landscape',
                background: finalBackground,
                logo: finalLogo
            };
        });
        
        if (continueWatchingPreview.items) {
            return {
                ...continueWatchingPreview,
                items
            };
        } else {
            return {
                ...continueWatchingPreview,
                content: {
                    ...continueWatchingPreview.content,
                    content: items
                }
            };
        }
    }, [continueWatchingPreview, sourceItems, metaDataMap]);

    React.useLayoutEffect(() => {
        onVisibleRangeChange();
    }, [board.catalogs, onVisibleRangeChange]);
    return (
        <div className={styles['board-container']}>
            <EventModal />
            <MainNavBars className={styles['board-content-container']} route={'board'}>
                <div ref={scrollContainerRef} className={styles['board-content']} onScroll={onScroll}>
                    <HeroShelf items={heroItems.length > 0 ? heroItems : undefined} />
                    {
                        (continueWatchingPreview?.items?.length > 0 || (continueWatchingPreview?.content?.content && Array.isArray(continueWatchingPreview.content.content) && continueWatchingPreview.content.content.length > 0)) ?
                            isLoadingMetaDetails ?
                                <MetaRow.Placeholder
                                    className={classnames(styles['board-row'], styles['continue-watching-row'], 'animation-fade-in')}
                                    title={t.string('BOARD_CONTINUE_WATCHING')}
                                    deepLinks={continueWatchingPreview?.deepLinks}
                                    previewSize={4}
                                    posterShape="landscape"
                                />
                                :
                                <MetaRow
                                    className={classnames(styles['board-row'], styles['continue-watching-row'], 'animation-fade-in')}
                                    title={t.string('BOARD_CONTINUE_WATCHING')}
                                    catalog={continueWatchingCatalog}
                                    itemComponent={ContinueWatchingItem}
                                    notifications={notifications}
                                    previewSize={4}
                                />
                            :
                            null
                    }
                    {board.catalogs.map((catalog, index) => {
                        switch (catalog.content?.type) {
                            case 'Ready': {
                                return (
                                    <MetaRow
                                        key={index}
                                        className={classnames(styles['board-row'], styles[`board-row-${catalog.content.content[0].posterShape}`], 'animation-fade-in')}
                                        catalog={catalog}
                                        itemComponent={MetaItem}
                                    />
                                );
                            }
                            case 'Err': {
                                if (catalog.content.content !== 'EmptyContent') {
                                    return (
                                        <MetaRow
                                            key={index}
                                            className={classnames(styles['board-row'], 'animation-fade-in')}
                                            catalog={catalog}
                                            message={catalog.content.content}
                                        />
                                    );
                                }
                                return null;
                            }
                            default: {
                                return (
                                    <MetaRow.Placeholder
                                        key={index}
                                        className={classnames(styles['board-row'], styles['board-row-poster'], 'animation-fade-in')}
                                        catalog={catalog}
                                        title={t.catalogTitle(catalog)}
                                    />
                                );
                            }
                        }
                    })}
                </div>
            </MainNavBars>
            {
                showStreamingServerWarning ?
                    <StreamingServerWarning className={styles['board-warning-container']} />
                    :
                    null
            }
        </div>
    );
};

const BoardFallback = () => (
    <div className={styles['board-container']}>
        <MainNavBars className={styles['board-content-container']} route={'board'} />
    </div>
);

module.exports = withCoreSuspender(Board, BoardFallback);
