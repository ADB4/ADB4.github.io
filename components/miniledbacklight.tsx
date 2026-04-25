/**
 * MiniLEDBacklight.tsx
 *
 * Simulates a mini-LED local dimming backlight grid. Each cell
 * illuminates based on proximity to the mouse cursor, with a
 * configurable falloff radius. Supports light/dark mode inversion
 * and color temperature control (Kelvin).
 *
 * Placement: components/miniledbacklight.tsx
 *
 * Props:
 *   cellSize          — Fixed pixel width/height per zone (default: 64)
 *   falloffRadius     — Number of cells outward the bloom extends (default: 3)
 *   colorTemperature  — Kelvin value for the illumination color (default: 6500)
 *   maxBrightness     — Peak opacity of a fully-lit cell, 0-1 (default: 0.95)
 *   minBrightness     — Baseline opacity of an unlit cell, 0-1 (default: 0.0)
 *   darkMode          — When true, cells glow bright on dark. When false, cells
 *                        darken on light (inverted). (default: false)
 *   className         — Additional CSS class for the container
 *   style             — Additional inline styles for the container
 *   children          — Content to render on top of the backlight layer
 */

'use client';

import React, {
    useRef,
    useState,
    useCallback,
    useMemo,
    useEffect,
} from 'react';
import { useGridDimensions } from '../hooks/useGridDimensions';
import {
    kelvinToRGB,
    invertRGB,
    rgbToCSS,
    RGB,
} from '../lib/colorTemperature';

export interface MiniLEDBacklightProps {
    cellSize?: number;
    falloffRadius?: number;
    colorTemperature?: number;
    maxBrightness?: number;
    minBrightness?: number;
    darkMode?: boolean;
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

const MiniLEDBacklight: React.FC<MiniLEDBacklightProps> = ({
                                                               cellSize = 64,
                                                               falloffRadius = 3,
                                                               colorTemperature = 6500,
                                                               maxBrightness = 0.95,
                                                               minBrightness = 0.0,
                                                               darkMode = false,
                                                               className,
                                                               style,
                                                               children,
                                                           }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLCanvasElement>(null);
    const animFrameRef = useRef<number | null>(null);
    const mouseRef = useRef<{ x: number; y: number } | null>(null);

    const { cols, rows } = useGridDimensions(cellSize, containerRef);

    // Precompute the illumination color
    const baseColor: RGB = useMemo(() => {
        const rgb = kelvinToRGB(colorTemperature);
        return darkMode ? rgb : invertRGB(rgb);
    }, [colorTemperature, darkMode]);

    // Substrate color: what an unlit cell looks like
    const substrateColor: string = useMemo(() => {
        if (darkMode) {
            return 'rgb(8, 8, 8)';
        }
        return 'rgb(248, 248, 248)';
    }, [darkMode]);

    // Precompute falloff lookup: distance -> brightness multiplier
    // Using inverse-square with a smooth cutoff, similar to how
    // physical LED bloom attenuates.
    const falloffLUT = useMemo(() => {
        const lut: number[] = [];
        const maxDist = falloffRadius + 1;
        for (let d = 0; d <= maxDist * 100; d++) {
            const dist = d / 100;
            if (dist > falloffRadius) {
                lut.push(0);
            } else {
                // Smooth hermite interpolation for natural falloff
                const t = dist / falloffRadius;
                const falloff = 1 - t * t * (3 - 2 * t); // smoothstep
                lut.push(falloff);
            }
        }
        return lut;
    }, [falloffRadius]);

    const getFalloff = useCallback(
        (distance: number): number => {
            const index = Math.round(distance * 100);
            if (index < 0) return 1;
            if (index >= falloffLUT.length) return 0;
            return falloffLUT[index];
        },
        [falloffLUT]
    );

    // Canvas rendering
    const render = useCallback(() => {
        const canvas = gridRef.current;
        if (!canvas || cols === 0 || rows === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = cols * cellSize;
        const height = rows * cellSize;

        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
        }

        const mouse = mouseRef.current;

        // Which cell is the mouse over?
        let mouseCellX = -1;
        let mouseCellY = -1;
        if (mouse && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const localX = mouse.x - rect.left;
            const localY = mouse.y - rect.top;
            mouseCellX = localX / cellSize;
            mouseCellY = localY / cellSize;
        }

        // Clear
        ctx.fillStyle = substrateColor;
        ctx.fillRect(0, 0, width, height);

        // Cell gap for that mini-LED zone look
        const gap = 1;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let brightness = minBrightness;

                if (mouseCellX >= 0 && mouseCellY >= 0) {
                    // Distance in cell-units from cell center to mouse position
                    const cx = col + 0.5;
                    const cy = row + 0.5;
                    const dx = cx - mouseCellX;
                    const dy = cy - mouseCellY;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    const falloff = getFalloff(dist);
                    brightness = minBrightness + (maxBrightness - minBrightness) * falloff;
                }

                if (brightness > 0.001) {
                    ctx.fillStyle = rgbToCSS(baseColor, brightness);
                    ctx.fillRect(
                        col * cellSize + gap,
                        row * cellSize + gap,
                        cellSize - gap * 2,
                        cellSize - gap * 2
                    );
                }
            }
        }

        // Draw grid lines (subtle zone boundaries)
        ctx.strokeStyle = darkMode
            ? 'rgba(255, 255, 255, 0.03)'
            : 'rgba(0, 0, 0, 0.03)';
        ctx.lineWidth = 1;

        for (let col = 1; col < cols; col++) {
            const x = col * cellSize;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        for (let row = 1; row < rows; row++) {
            const y = row * cellSize;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }, [
        cols,
        rows,
        cellSize,
        baseColor,
        substrateColor,
        darkMode,
        minBrightness,
        maxBrightness,
        getFalloff,
    ]);

    // Mouse tracking
    const handleMouseMove = useCallback((e: MouseEvent) => {
        mouseRef.current = { x: e.clientX, y: e.clientY };
    }, []);

    const handleMouseLeave = useCallback(() => {
        mouseRef.current = null;
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('mousemove', handleMouseMove, { passive: true });
        container.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [handleMouseMove, handleMouseLeave]);

    // Animation loop
    useEffect(() => {
        const loop = () => {
            render();
            animFrameRef.current = requestAnimationFrame(loop);
        };
        animFrameRef.current = requestAnimationFrame(loop);

        return () => {
            if (animFrameRef.current !== null) {
                cancelAnimationFrame(animFrameRef.current);
            }
        };
    }, [render]);

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                backgroundColor: substrateColor,
                ...style,
            }}
        >
            <canvas
                ref={gridRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    imageRendering: 'pixelated',
                    pointerEvents: 'none',
                }}
            />
            {children && (
                <div
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        width: '100%',
                        height: '100%',
                    }}
                >
                    {children}
                </div>
            )}
        </div>
    );
};

export default MiniLEDBacklight;