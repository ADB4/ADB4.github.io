'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

/*
PagedArticle

Lays an article out as book pages instead of a vertical scroll. The
markdown flows into fixed-height CSS columns that overflow sideways;
each column is one page, and the frame scrolls one page (or one
two-page spread) at a time. Page geometry lives in
app/writing.css, which
reports how many pages are visible at once through --per-view
(0 means the space is too small and the article falls back to scrolling).

The frame is a real scroll container rather than a transformed strip,
so find-in-page, #anchor links, and keyboard focus can still scroll
content into view on their own.
*/

interface PageLayout {
    perView: number; // 0 = scrolling fallback, 1 = single page, 2 = spread
    pages: number;   // 0 until the first measurement
}

// Accumulated wheel distance (px) that turns a page mid-gesture.
const WHEEL_THRESHOLD = 40;
// A wheel gesture ends after this long without events, which lets a
// trackpad's inertia tail finish without turning extra pages. Timed with a
// timer rather than event.timeStamp, which isn't always populated.
const WHEEL_QUIET_MS = 180;
// Delay after the last scroll event before the reading position is saved.
const SETTLE_MS = 150;

// Exact width of one view. clientWidth rounds to whole pixels, which drifts
// from the snap points by a fraction of a pixel per page.
const viewWidth = (frame: HTMLElement) => frame.getBoundingClientRect().width;

// First element that starts inside the visible view. Used to restore the
// reading position when the page count changes on resize.
const findAnchor = (frame: HTMLElement, flow: Element): Element | null => {
    const { left, right } = frame.getBoundingClientRect();
    for (const el of Array.from(flow.querySelectorAll('*'))) {
        const rect = el.getClientRects()[0];
        if (rect && rect.left >= left - 1 && rect.left < right) return el;
    }
    return null;
};

const PagedArticle = ({ children }: { children: ReactNode }) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<HTMLDivElement>(null);
    const anchorRef = useRef<Element | null>(null);
    const pendingViewRef = useRef<number | null>(null);
    const targetViewRef = useRef<number | null>(null);
    const viewsRef = useRef(0);
    const [layout, setLayout] = useState<PageLayout>({ perView: 1, pages: 0 });
    const [view, setView] = useState(0);

    const views = layout.perView > 0 ? Math.ceil(layout.pages / layout.perView) : 0;

    const measure = useCallback(() => {
        const frame = frameRef.current;
        // The markdown wrapper is always the frame's first child; snap markers follow it.
        const flow = frame?.firstElementChild;
        if (!frame || !flow) return;

        const perView = Number(getComputedStyle(frame).getPropertyValue('--per-view')) || 0;
        if (perView === 0) {
            viewsRef.current = 0;
            setLayout({ perView: 0, pages: 0 });
            return;
        }

        // Offsets are taken from the flow's left edge, which moves with the
        // scroll position, so they don't depend on the page currently shown.
        const pageWidth = viewWidth(frame) / perView;
        const flowLeft = flow.getBoundingClientRect().left;
        const lastRects = flow.lastElementChild?.getClientRects();
        const pages = lastRects?.length
            ? Math.max(1, Math.ceil((lastRects[lastRects.length - 1].right - flowLeft) / pageWidth))
            : 1;
        const viewCount = Math.ceil(pages / perView);

        const anchorRect = anchorRef.current?.isConnected ? anchorRef.current.getClientRects()[0] : undefined;
        const restoredView = anchorRect
            ? Math.floor((anchorRect.left - flowLeft) / pageWidth / perView)
            : Math.round(frame.scrollLeft / viewWidth(frame));

        viewsRef.current = viewCount;
        pendingViewRef.current = Math.min(Math.max(restoredView, 0), viewCount - 1);
        setLayout({ perView, pages });
    }, []);

    // Jump to the restored view once the snap markers for the new layout exist.
    useLayoutEffect(() => {
        const frame = frameRef.current;
        const pending = pendingViewRef.current;
        if (!frame || pending === null) return;
        pendingViewRef.current = null;
        frame.scrollTo({ left: pending * viewWidth(frame), behavior: 'instant' });
        setView(pending);
    }, [layout]);

    const goTo = useCallback((target: number) => {
        const frame = frameRef.current;
        if (!frame || viewsRef.current === 0) return;
        const next = Math.min(Math.max(target, 0), viewsRef.current - 1);
        targetViewRef.current = next;
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        frame.scrollTo({ left: next * viewWidth(frame), behavior: reduceMotion ? 'instant' : 'smooth' });
    }, []);

    const turn = useCallback((delta: number) => {
        const frame = frameRef.current;
        if (!frame) return;
        // While a smooth scroll is in flight, step from where it's headed.
        const from = targetViewRef.current ?? Math.round(frame.scrollLeft / viewWidth(frame));
        goTo(from + delta);
    }, [goTo]);

    // Re-paginate when the frame resizes, when late fonts arrive (Swiss721
    // comes from a CDN), and when images load.
    useEffect(() => {
        const frame = frameRef.current;
        if (!frame) return;
        let raf = 0;
        const schedule = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(measure);
        };
        const resizeObserver = new ResizeObserver(schedule);
        resizeObserver.observe(frame);
        document.fonts.ready.then(schedule);
        document.fonts.addEventListener('loadingdone', schedule);
        frame.addEventListener('load', schedule, true);
        return () => {
            cancelAnimationFrame(raf);
            resizeObserver.disconnect();
            document.fonts.removeEventListener('loadingdone', schedule);
            frame.removeEventListener('load', schedule, true);
        };
    }, [measure]);

    // Track the visible page, and save the reading position once scrolling settles.
    useEffect(() => {
        const frame = frameRef.current;
        if (!frame) return;
        let raf = 0;
        let settle: ReturnType<typeof setTimeout> | undefined;
        const onScroll = () => {
            if (viewsRef.current === 0) return;
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => setView(Math.round(frame.scrollLeft / viewWidth(frame))));
            clearTimeout(settle);
            settle = setTimeout(() => {
                targetViewRef.current = null;
                const flow = frame.firstElementChild;
                if (flow) anchorRef.current = findAnchor(frame, flow) ?? anchorRef.current;
            }, SETTLE_MS);
        };
        frame.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(settle);
            frame.removeEventListener('scroll', onScroll);
        };
    }, []);

    // Keyboard and mouse wheel page turns. Horizontal trackpad and touch
    // swipes are left to native scrolling, where scroll snapping lands them on a page.
    useEffect(() => {
        const root = rootRef.current;
        const frame = frameRef.current;
        if (!root || !frame) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (viewsRef.current === 0 || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
            if ((e.target as HTMLElement).closest?.('input, textarea, select, [contenteditable]')) return;
            switch (e.key) {
                case 'ArrowRight':
                case 'PageDown':
                    turn(1);
                    break;
                case 'ArrowLeft':
                case 'PageUp':
                    turn(-1);
                    break;
                case 'Home':
                    goTo(0);
                    break;
                case 'End':
                    goTo(viewsRef.current - 1);
                    break;
                default:
                    return;
            }
            e.preventDefault();
        };

        // Browsers decide from a gesture's first wheel event whether the page
        // handles the whole gesture: cancel it and native scrolling stays off
        // until the gesture ends. So a gesture that starts vertically is
        // claimed and turned here (by whichever axis ends up dominant, since a
        // swipe can start with vertical drift), and one that starts
        // horizontally is left to native scrolling and snapping.
        const newGesture = () => ({ claimed: null as boolean | null, dx: 0, dy: 0, turned: false });
        let gesture = newGesture();
        let gestureEnd: ReturnType<typeof setTimeout> | undefined;
        const dominantDelta = () => (Math.abs(gesture.dx) > Math.abs(gesture.dy) ? gesture.dx : gesture.dy);
        const endGesture = () => {
            // A slow mouse-wheel click is a single small event (about 4px in
            // Safari) that never reaches the threshold, so a claimed gesture
            // that ends without turning still turns once.
            const delta = dominantDelta();
            if (gesture.claimed && !gesture.turned && Math.abs(delta) >= 1) turn(Math.sign(delta));
            gesture = newGesture();
        };
        const onWheel = (e: WheelEvent) => {
            // ctrlKey is set for trackpad pinch-zoom, which should stay a zoom.
            if (viewsRef.current === 0 || e.ctrlKey) return;
            clearTimeout(gestureEnd);
            gestureEnd = setTimeout(endGesture, WHEEL_QUIET_MS);
            if (gesture.claimed === null) {
                if (e.deltaX === 0 && e.deltaY === 0) return;
                gesture.claimed = Math.abs(e.deltaY) > Math.abs(e.deltaX);
            }
            if (!gesture.claimed) return;
            e.preventDefault();
            if (gesture.turned) return;
            const scale = e.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16
                : e.deltaMode === WheelEvent.DOM_DELTA_PAGE ? frame.clientHeight
                : 1;
            gesture.dx += e.deltaX * scale;
            gesture.dy += e.deltaY * scale;
            const delta = dominantDelta();
            if (Math.abs(delta) >= WHEEL_THRESHOLD) {
                turn(Math.sign(delta));
                gesture.turned = true;
            }
        };

        document.addEventListener('keydown', onKeyDown);
        root.addEventListener('wheel', onWheel, { passive: false });
        return () => {
            clearTimeout(gestureEnd);
            document.removeEventListener('keydown', onKeyDown);
            root.removeEventListener('wheel', onWheel);
        };
    }, [goTo, turn]);

    const shownView = Math.min(view, Math.max(views - 1, 0));
    const firstPage = shownView * layout.perView + 1;
    const lastPage = Math.min(firstPage + layout.perView - 1, layout.pages);
    const label = layout.pages === 0 ? ''
        : firstPage === lastPage ? `Page ${firstPage} of ${layout.pages}`
        : `Pages ${firstPage}–${lastPage} of ${layout.pages}`;

    return (
        <div className="paged-article" ref={rootRef}>
            <div className="page-stage">
                <div className="page-frame" ref={frameRef} tabIndex={0} role="region" aria-label="Article pages">
                    {children}
                    {Array.from({ length: views }, (_, i) => (
                        <div key={i} className="page-snap" style={{ left: `${i * 100}%` }} aria-hidden="true" />
                    ))}
                </div>
            </div>
            {/* Hidden rather than removed in the scrolling fallback: removing it
                would give the stage its height back, which can flip the layout
                straight back to paged and loop. */}
            <div className="page-controls" style={layout.perView === 0 ? { visibility: 'hidden' } : undefined}>
                <button type="button" onClick={() => turn(-1)} disabled={shownView <= 0}>Prev</button>
                <p aria-live="polite">{label}</p>
                <button type="button" onClick={() => turn(1)} disabled={shownView >= views - 1}>Next</button>
            </div>
        </div>
    );
};

export default PagedArticle;
