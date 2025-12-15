// Copyright (C) 2017-2024 Smart code 203358507

import React, { useCallback, useLayoutEffect, useMemo, useRef, useState, MouseEvent } from 'react';
import classNames from 'classnames';
import { Button, Image } from 'stremio/components';
import styles from './Cell.less';

type Props = {
    selected: CalendarDate | null,
    monthInfo: CalendarMonthInfo,
    date: CalendarDate,
    items: CalendarContentItem[],
    onClick: (date: CalendarDate) => void,
};

const Cell = ({ selected, monthInfo, date, items, onClick }: Props) => {
    const titlesRef = useRef<HTMLDivElement>(null);
    const [active, today] = useMemo(() => [
        date.day === selected?.day,
        date.day === monthInfo.today,
    ], [selected, monthInfo, date]);

    const backgroundPoster = useMemo(() => {
        return items.find((item) => typeof item.poster === 'string' && item.poster.length > 0)?.poster ?? null;
    }, [items]);

    const displayedItems = useMemo(() => {
        return items.slice(0, 4);
    }, [items]);

    const [titleSizes, setTitleSizes] = useState<Record<string, number>>({});

    const onCellClick = () => {
        onClick && onClick(date);
    };

    const onInnerClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
        event.stopPropagation();
    }, []);

    useLayoutEffect(() => {
        const el = titlesRef.current;
        if (!el) return;

        let raf = 0;

        const measure = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const root = titlesRef.current;
                if (!root) return;

                const computed = getComputedStyle(root);
                const basePx = parseFloat(computed.getPropertyValue('--baseTitleSize')) || 18;
                const minPx = parseFloat(computed.getPropertyValue('--minTitleSize')) || 12;
                const maxPxCss = parseFloat(computed.getPropertyValue('--maxTitleSize')) || 30;
                const lineHeightFactor = parseFloat(computed.getPropertyValue('--titleLineHeight')) || 1.25;
                const sideMargin = parseFloat(computed.getPropertyValue('--titleSideMarginPx')) || 6;

                const buttons = Array.from(root.querySelectorAll<HTMLAnchorElement | HTMLButtonElement>('[data-fit-title="true"]'));
                const lines = buttons.length;
                if (!lines) return;

                const rootRect = root.getBoundingClientRect();
                const rootPaddingTop = parseFloat(getComputedStyle(root).paddingTop) || 0;
                const rootPaddingBottom = parseFloat(getComputedStyle(root).paddingBottom) || 0;
                const rootGap = parseFloat(getComputedStyle(root).rowGap || getComputedStyle(root).gap) || 0;
                const availableHeight = Math.max(0, rootRect.height - rootPaddingTop - rootPaddingBottom);
                const maxPxByHeight = Math.floor((availableHeight - Math.max(0, lines - 1) * rootGap) / (lines * lineHeightFactor));
                const maxPx = Math.max(minPx, Math.min(maxPxCss, maxPxByHeight));

                const next: Record<string, number> = {};
                for (const btn of buttons) {
                    const id = btn.getAttribute('data-fit-id');
                    if (!id) continue;

                    const span = btn.querySelector<HTMLElement>('[data-fit-text="true"]');
                    if (!span) continue;

                    span.style.fontSize = `${basePx}px`;
                    const availableWidth = Math.max(0, btn.clientWidth - sideMargin * 2);
                    const textWidth = span.scrollWidth || 1;
                    const target = Math.floor(basePx * (availableWidth / textWidth));
                    next[id] = Math.max(minPx, Math.min(maxPx, target));
                }

                setTitleSizes(next);
            });
        };

        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
        };
    }, [displayedItems]);

    return (
        <Button
            className={classNames(styles['cell'], {
                [styles['active']]: active,
                [styles['today']]: today,
                [styles['hasPoster']]: !!backgroundPoster,
            })}
            onClick={onCellClick}
        >
            <div className={styles['heading']}>
                <div className={styles['day']}>
                    {date.day}
                </div>
            </div>
            <div className={styles['content']}>
                {
                    backgroundPoster ?
                        <Image className={styles['background']} src={backgroundPoster} alt={' '} />
                        :
                        <div className={styles['backgroundPlaceholder']} />
                }
                <div className={styles['titles']} onClick={onInnerClick} ref={titlesRef}>
                    {
                        displayedItems.map(({ id, name, deepLinks }) => (
                            <Button
                                key={id}
                                className={styles['titleLink']}
                                href={deepLinks.metaDetailsStreams}
                                data-fit-title={true}
                                data-fit-id={id}
                            >
                                <span
                                    className={styles['titleText']}
                                    data-fit-text={true}
                                    style={titleSizes[id] ? { fontSize: `${titleSizes[id]}px` } : undefined}
                                >
                                    {name}
                                </span>
                            </Button>
                        ))
                    }
                    {
                        items.length > 4 ?
                            <div className={styles['moreCount']}>+{items.length - 4} more</div>
                            :
                            null
                    }
                </div>
            </div>
        </Button>
    );
};

export default Cell;
