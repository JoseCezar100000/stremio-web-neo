// Copyright (C) 2017-2024 Smart code 203358507

import React, { useMemo } from 'react';
import { CalendarDays } from 'lucide-react';
import { Item, ItemPlaceholder } from './Item';
import styles from './List.less';

type Props = {
    items: CalendarItem[],
    selected: CalendarDate | null,
    monthInfo: CalendarMonthInfo,
    profile: Profile,
    onChange: (date: CalendarDate) => void,
};

const List = ({ items, selected, monthInfo, profile, onChange }: Props) => {
    const filteredItems = useMemo(() => {
        return items.filter(({ items }) => items.length);
    }, [items]);

    return (
        <div className={styles['list']}>
            <div className={styles['header']}>
                <div className={styles['headerText']}>
                    <div className={styles['headerTitle']}>Up Next</div>
                    <div className={styles['headerSubtitle']}>Your schedule</div>
                </div>
                <CalendarDays className={styles['headerIcon']} />
            </div>
            {
                items.length === 0 ?
                    [1, 2, 3].map((index) => (
                        <ItemPlaceholder key={index} />
                    ))
                    :
                    filteredItems.map((item) => (
                        <Item
                            key={item.date.day}
                            {...item}
                            selected={selected}
                            monthInfo={monthInfo}
                            profile={profile}
                            onClick={onChange}
                        />
                    ))
            }
        </div>
    );
};

export default List;
