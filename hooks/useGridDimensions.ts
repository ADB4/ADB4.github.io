/**
 * useGridDimensions.ts
 *
 * Computes how many cells fit in the viewport at a fixed cell size,
 * re-computing on window resize. Returns column count, row count,
 * and the total cell count.
 *
 * Placement: hooks/useGridDimensions.ts
 */

'use client';

import { useState, useEffect, useCallback } from 'react';

export interface GridDimensions {
    cols: number;
    rows: number;
    total: number;
    containerWidth: number;
    containerHeight: number;
}

export function useGridDimensions(
    cellSize: number,
    containerRef: React.RefObject<HTMLElement | null>
): GridDimensions {
    const [dimensions, setDimensions] = useState<GridDimensions>({
        cols: 0,
        rows: 0,
        total: 0,
        containerWidth: 0,
        containerHeight: 0,
    });

    const recalculate = useCallback(() => {
        const el = containerRef.current;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        // Ceiling so the grid bleeds to the edges rather than leaving gaps
        const cols = Math.ceil(rect.width / cellSize);
        const rows = Math.ceil(rect.height / cellSize);

        setDimensions({
            cols,
            rows,
            total: cols * rows,
            containerWidth: rect.width,
            containerHeight: rect.height,
        });
    }, [cellSize, containerRef]);

    useEffect(() => {
        recalculate();

        const observer = new ResizeObserver(() => {
            recalculate();
        });

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            observer.disconnect();
        };
    }, [recalculate, containerRef]);

    return dimensions;
}