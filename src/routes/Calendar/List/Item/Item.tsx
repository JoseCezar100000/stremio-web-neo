// Copyright (C) 2017-2024 Smart code 203358507

import React, { useEffect, useMemo, useRef } from 'react';
import Icon from '@stremio/stremio-icons/react';
import classNames from 'classnames';
import { Button, Image } from 'stremio/components';
import useCalendarDate from '../../useCalendarDate';
import styles from './Item.less';

type Props = {
    selected: CalendarDate | null,
    monthInfo: CalendarMonthInfo,
    date: CalendarDate,
    items: CalendarContentItem[],
    profile: Profile,
    onClick: (date: CalendarDate) => void,
};

const Item = ({ selected, monthInfo, date, items, profile, onClick }: Props) => {
    const ref = useRef<HTMLDivElement>(null);
    const { toDayMonth } = useCalendarDate(profile);

    const [active, today] = useMemo(() => [
        date.day === selected?.day,
        date.day === monthInfo.today,
    ], [selected, monthInfo, date]);

    const airingTag = useMemo(() => {
        if (monthInfo.today === null) return null;
        if (date.day === monthInfo.today) return 'Airing Today';
        if (date.day === monthInfo.today + 1) return 'Airing Tomorrow';
        return null;
    }, [date.day, monthInfo.today]);

    const onItemClick = () => {
        onClick && onClick(date);
    };

    useEffect(() => {
        active && ref.current?.scrollIntoView({
            block: 'start',
            behavior: 'smooth',
        });
    }, [active]);

    return (
        <div
            ref={ref}
            className={classNames(styles['item'], { [styles['active']]: active, [styles['today']]: today })}
            key={date.day}
            onClick={onItemClick}
        >
            <div className={styles['heading']}>
                {toDayMonth(date)}
            </div>
            <div className={styles['body']}>
                {
                    items.map(({ id, name, title, poster, season, episode, deepLinks }) => (
                        <Button className={styles['video']} key={id} href={deepLinks.metaDetailsStreams}>
                            <div className={styles['posterWrap']}>
                                {
                                    typeof poster === 'string' && poster.length > 0 ?
                                        <Image className={styles['poster']} src={poster} alt={name} />
                                        :
                                        <div className={styles['posterPlaceholder']} />
                                }
                            </div>
                            <div className={styles['meta']}>
                                <div className={styles['nameRow']}>
                                    <div className={styles['name']}>{name}</div>
                                    {
                                        airingTag ?
                                            <div className={styles['tag']}>{airingTag}</div>
                                            :
                                            null
                                    }
                                </div>
                                <div className={styles['subRow']}>
                                    <div className={styles['info']}>S{season}E{episode}</div>
                                    {
                                        typeof title === 'string' && title.length > 0 ?
                                            <div className={styles['episodeTitle']}>{title}</div>
                                            :
                                            null
                                    }
                                </div>
                            </div>
                            <Icon className={styles['icon']} name={'play'} />
                        </Button>
                    ))
                }
            </div>
        </div>
    );
};

export default Item;
