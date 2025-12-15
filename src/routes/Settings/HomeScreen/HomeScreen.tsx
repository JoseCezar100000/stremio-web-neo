// Copyright (C) 2017-2025 Smart code 203358507

import React, { forwardRef, useMemo, useState, useCallback } from 'react';
import { Toggle, Button } from 'stremio/components';
import { useTranslate } from 'stremio/common';
import { getCatalogId } from 'stremio/common/useCatalogPreferences';
import { Category, Option, Section } from '../components';
import useHomeScreenOptions from './useHomeScreenOptions';
import styles from './HomeScreen.less';
import Icon from '@stremio/stremio-icons/react';

type Props = {
    profile: Profile,
};

const HomeScreen = forwardRef<HTMLDivElement, Props>(({ profile }: Props, ref) => {
    const t = useTranslate();
    const {
        heroSectionEnabledToggle,
        getCatalogToggle,
        getCatalogHeroButton,
        reorderCatalogs,
        catalogs,
    } = useHomeScreenOptions();

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const orderedCatalogs = useMemo(() => {
        // Use catalog order from preferences, fallback to original order
        const catalogIds = catalogs.map(c => getCatalogId(c)).filter((id): id is string => id !== null);
        const order = reorderCatalogs.getCatalogOrder();
        
        if (order.length > 0) {
            // Sort by order array
            const ordered = [...catalogs].sort((a, b) => {
                const idA = getCatalogId(a);
                const idB = getCatalogId(b);
                if (!idA || !idB) return 0;
                const indexA = order.indexOf(idA);
                const indexB = order.indexOf(idB);
                if (indexA === -1 && indexB === -1) return 0;
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });
            return ordered;
        }
        return catalogs;
    }, [catalogs, reorderCatalogs]);

    const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', '');
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverIndex(index);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOverIndex(null);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        const draggedCatalog = orderedCatalogs[draggedIndex];
        const newOrder = [...orderedCatalogs];
        newOrder.splice(draggedIndex, 1);
        newOrder.splice(dropIndex, 0, draggedCatalog);
        
        const catalogIds = newOrder.map(c => getCatalogId(c)).filter((id): id is string => id !== null);
        reorderCatalogs.setCatalogOrder(catalogIds);
        
        setDraggedIndex(null);
        setDragOverIndex(null);
    }, [draggedIndex, orderedCatalogs, reorderCatalogs]);

    return (
        <Section ref={ref} label={'SETTINGS_NAV_HOME_SCREEN'}>
            <Option label={'SETTINGS_HOME_SCREEN_ENABLE_HERO'}>
                <Toggle
                    tabIndex={-1}
                    {...heroSectionEnabledToggle}
                />
            </Option>

            <Category icon={'grid'} label={'SETTINGS_HOME_SCREEN_CATALOGS'}>
                {orderedCatalogs.length === 0 ? (
                    <div className={styles['empty-state']}>
                        {t.string('SETTINGS_HOME_SCREEN_NO_CATALOGS')}
                    </div>
                ) : (
                    orderedCatalogs.map((catalog, index) => {
                        const catalogId = getCatalogId(catalog) || `catalog-${Math.random()}`;
                        const catalogTitle = t.catalogTitle(catalog) || 'Unknown Catalog';
                        const catalogToggle = getCatalogToggle(catalog);
                        const heroButton = getCatalogHeroButton(catalog);
                        const isDragging = draggedIndex === index;
                        const isDragOver = dragOverIndex === index;

                        return (
                            <div
                                key={catalogId}
                                className={`${styles['catalog-item']} ${isDragging ? styles['dragging'] : ''} ${isDragOver ? styles['drag-over'] : ''}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, index)}
                            >
                                <div className={styles['catalog-content']}>
                                    <div className={styles['drag-handle']} title={t.string('SETTINGS_HOME_SCREEN_DRAG_HANDLE')}>
                                        <div className={styles['drag-handle-icon']} />
                                    </div>
                                    <div className={styles['catalog-title']} title={catalogTitle}>
                                        {catalogTitle}
                                    </div>
                                    <div className={styles['catalog-controls']}>
                                        <Button
                                            className={`${styles['hero-button']} ${heroButton.checked ? styles['hero-active'] : ''} ${heroButton.disabled ? styles['disabled'] : ''}`}
                                            title={t.string('SETTINGS_HOME_SCREEN_SHOW_IN_HERO')}
                                            onClick={heroButton.onClick}
                                            disabled={heroButton.disabled}
                                            tabIndex={-1}
                                        >
                                            <span className={styles['hero-label']}>{t.string('HERO')}</span>
                                        </Button>
                                        <Toggle
                                            className={styles['catalog-toggle']}
                                            tabIndex={-1}
                                            {...catalogToggle}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </Category>
        </Section>
    );
});

export default HomeScreen;

