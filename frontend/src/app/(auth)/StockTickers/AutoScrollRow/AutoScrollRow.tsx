'use client'
import React, { PropsWithChildren } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
import styles from './AutoScrollRow.module.css'

type Props = {
    speed?: number;
    pauseOnHover?: boolean;
    direction?: 'forward' | 'backward';
};

export default function AutoScrollRow( {children, speed = 1.1, pauseOnHover= true, direction = 'forward' }: PropsWithChildren<Props>) {

    const [embelaRef] = useEmblaCarousel(
        { loop: true, dragFree: true, containScroll: "trimSnaps",},
        [ AutoScroll({speed, direction, stopOnInteraction: false, stopOnMouseEnter: pauseOnHover, startDelay: 0, playOnInit: true}),],
    );

    return (
        <section className={styles.embela} aria-roledescription='carousel'>
            <div className={styles.embelaViewport} ref={embelaRef}>
                <div className={styles.embelaContainer}>
                    {React.Children.map(children, (child, i) => (
                        <div className={styles.embelaSlide} key={i}>
                            {child}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}