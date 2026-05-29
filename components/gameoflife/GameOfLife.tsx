import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Pattern, Scene } from "./patterns";
import { patternsForScene } from "./patterns";

type Grid = Uint8Array;

interface Dimensions {
    readonly rows: number;
    readonly cols: number;
}

const index = (r: number, c: number, cols: number): number => r * cols + c;

function liveNeighbours(
    grid: Grid,
    { rows, cols }: Dimensions,
    r: number,
    c: number,
): number {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            // Off-grid counts as dead, which for an oscillator boxed in its
            // footprint is the same as the infinite plane
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            count += grid[index(nr, nc, cols)];
        }
    }
    return count;
}

/* One Conway step. the input grid is never touched */
function nextGeneration(grid: Grid, dims: Dimensions): Grid {
    const { rows, cols } = dims;
    const next = new Uint8Array(rows * cols);
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const i = index(r, c, cols);
            const alive = grid[i] === 1;
            const n = liveNeighbours(grid, dims, r, c);
            next[i] = (alive ? n === 2 || n === 3 : n === 3) ? 1 : 0;
        }
    }
    return next;
}


interface ParsedRle {
    cells: Array<[number, number]>;
    rule: string;
}

function parseRle(text: string): ParsedRle {
    let header = "";
    let data = "";
    for (const raw of text.split(/\r?\n/)) {
        const line = raw.trim();
        if (line === "" || line.startsWith("#")) continue;
        if (header === "" && /^x\s*=/i.test(line)) {
            header = line;
            continue;
        }
        data += line;
    }

    const ruleMatch = header.match(/rule\s*=\s*([^,\s]+)/i);
    const rule = ruleMatch ? ruleMatch[1] : "";

    const cells: Array<[number, number]> = [];
    let row = 0;
    let col = 0;
    let count = 0;
    for (const ch of data) {
        if (ch >= "0" && ch <= "9") {
            count = count * 10 + (ch.charCodeAt(0) - 48);
        } else if (ch === "b" || ch === ".") {
            col += count || 1;
            count = 0;
        } else if (ch === "$") {
            row += count || 1;
            col = 0;
            count = 0;
        } else if (ch === "!") {
            break;
        } else if (ch !== " " && ch !== "\t") {
            // Anything that isn't b/./$/!/digit/space is a live cell covers
            // `o` and the multi-state letters (A, B etc) we treat as alive
            const n = count || 1;
            for (let k = 0; k < n; k++) cells.push([row, col++]);
            count = 0;
        }
    }
    return { cells, rule };
}

const MAX_PERIOD = 1000;

function analyzePattern(cells: Array<[number, number]>, name: string): Pattern {
    if (cells.length === 0) {
        return { name, cells: [], rows: 1, cols: 1, offset: [0, 0], period: 1, symmetric: false };
    }

    // Seed to origin
    const minSeedR = Math.min(...cells.map(([r]) => r));
    const minSeedC = Math.min(...cells.map(([, c]) => c));
    const seed = cells.map(([r, c]) => [r - minSeedR, c - minSeedC] as [number, number]);
    const seedH = Math.max(...seed.map(([r]) => r)) + 1;
    const seedW = Math.max(...seed.map(([, c]) => c)) + 1;

    // Pad so a growing oscillator never runs into the wall mid-cycle
    const pad = Math.max(seedH, seedW, 12);
    const R = seedH + pad * 2;
    const C = seedW + pad * 2;
    const dims: Dimensions = { rows: R, cols: C };
    const place = (cs: Array<[number, number]>): Grid => {
        const g = new Uint8Array(R * C);
        for (const [r, c] of cs) g[index(r + pad, c + pad, C)] = 1;
        return g;
    };

    const seedGrid = place(seed);
    const seedKey = seedGrid.join("");

    let cur = seedGrid;
    let period = 0;
    // Swept box, in padded coords.
    let minR = pad, maxR = pad + seedH - 1, minC = pad, maxC = pad + seedW - 1;
    const expand = (g: Grid): void => {
        for (let r = 0; r < R; r++) {
            for (let c = 0; c < C; c++) {
                if (g[index(r, c, C)]) {
                    if (r < minR) minR = r;
                    if (r > maxR) maxR = r;
                    if (c < minC) minC = c;
                    if (c > maxC) maxC = c;
                }
            }
        }
    };

    for (let i = 1; i <= MAX_PERIOD; i++) {
        cur = nextGeneration(cur, dims);
        expand(cur);
        if (cur.join("") === seedKey) {
            period = i;
            break;
        }
    }

    if (period === 0) {
        if (typeof console !== "undefined") {
            console.warn(
                `[LifeOscillators] "${name}" is not a finite oscillator within ${MAX_PERIOD} ` +
                `generations (it may be a spaceship or methuselah). Tiling it may look chaotic.`,
            );
        }
        return {
            name, cells: seed, rows: seedH, cols: seedW, offset: [0, 0], period: 1, symmetric: false,
        };
    }

    // Footprint is the swept box; offset shifts the seed's origin within it
    return {
        name,
        cells: seed,
        rows: maxR - minR + 1,
        cols: maxC - minC + 1,
        offset: [pad - minR, pad - minC],
        period,
        symmetric: false,
    };
}

/*
Scene construction
*/

function stamp(grid: Grid, dims: Dimensions, p: Pattern, top: number, left: number): void {
    const [dr, dc] = p.offset;
    for (const [r, c] of p.cells) {
        const rr = top + dr + r;
        const cc = left + dc + c;
        if (rr < 0 || rr >= dims.rows || cc < 0 || cc >= dims.cols) continue;
        grid[index(rr, cc, dims.cols)] = 1;
    }
}

function buildScene(
    dims: Dimensions,
    scene: Scene,
    gap = 2,
    override?: Pattern[],
): Grid {
    const grid = new Uint8Array(dims.rows * dims.cols);
    const patterns =
        override && override.length > 0 ? override : patternsForScene(scene);

    const unitR = Math.max(...patterns.map((p) => p.rows)) + gap;
    const unitC = Math.max(...patterns.map((p) => p.cols)) + gap;

    const tilesDown = Math.max(1, Math.floor((dims.rows + gap) / unitR));
    const tilesAcross = Math.max(1, Math.floor((dims.cols + gap) / unitC));

    const offsetR = Math.floor((dims.rows - (tilesDown * unitR - gap)) / 2);
    const offsetC = Math.floor((dims.cols - (tilesAcross * unitC - gap)) / 2);

    let k = 0;
    for (let i = 0; i < tilesDown; i++) {
        for (let j = 0; j < tilesAcross; j++) {
            const p = patterns[k++ % patterns.length];
            const top = offsetR + i * unitR + Math.floor((unitR - gap - p.rows) / 2);
            const left = offsetC + j * unitC + Math.floor((unitC - gap - p.cols) / 2);
            stamp(grid, dims, p, top, left);
        }
    }
    return grid;
}

/*
reduced-motion preference (live)
 */

function usePrefersReducedMotion(): boolean {
    const [reduced, setReduced] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReduced(mq.matches);
        const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
        mq.addEventListener("change", onChange);
        return () => mq.removeEventListener("change", onChange);
    }, []);
    return reduced;
}

/*
 Colour resolution

 Canvas 2D won't read `var(--x)`: it ignores the assignment and silently keeps
 the previous fillStyle. So resolve custom properties ourselves with
 getComputedStyle, scoped to the canvas so it picks up the theme in effect
 and do it at draw time so live theme switches keep working
*/

function resolveColor(value: string, el: Element): string {
    if (!value.includes("var(")) return value;
    // Handles var(--name) and var(--name, fallback).
    const match = value.match(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)/);
    if (!match) return value;
    const [, name, fallback] = match;
    const resolved = getComputedStyle(el).getPropertyValue(name).trim();
    return resolved || fallback?.trim() || value;
}

/*
Component
*/

interface LifeOscillatorsProps {
    rows?: number;
    cols?: number;
    cellSize?: number;
    /** Generations per second */
    speed?: number;
    /*
     "symmetric" (default) or "mixed" for a field, or any single pattern name
     */
    scene?: Scene;
    /*
     RLE pattern string(s), Golly/copy.sh flavour. If given, these tile instead
     of `scene`; each is parsed and simulated for its period and footprint.
     Non-oscillators warn and may look messy
     */
    rle?: string | string[];
    aliveColor?: string;
    backgroundColor?: string;
    className?: string;
}

export default function LifeOscillators({
                                            rows = 32,
                                            cols = 32,
                                            cellSize = 8,
                                            speed = 7,
                                            scene = "symmetric",
                                            rle,
                                            aliveColor = "var(--text-primary)",
                                            backgroundColor = "transparent",
                                            className,
                                        }: LifeOscillatorsProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Parse + analyze any RLE once per input. [] means "no override, use scene"
    const rlePatterns = useMemo<Pattern[]>(() => {
        if (!rle) return [];
        const sources = Array.isArray(rle) ? rle : [rle];
        return sources
            .map((text, i) => analyzePattern(parseRle(text).cells, `rle-${i}`))
            .filter((p) => p.cells.length > 0);
    }, [rle]);

    const gridRef = useRef<Grid>(buildScene({ rows, cols }, scene, 2, rlePatterns));
    const reducedMotion = usePrefersReducedMotion();

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const cssW = cols * cellSize;
        const cssH = rows * cellSize;
        if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
            canvas.width = cssW * dpr;
            canvas.height = cssH * dpr;
            canvas.style.width = `${cssW}px`;
            canvas.style.height = `${cssH}px`;
        }

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // Clear so a transparent backdrop shows through. paint one only if asked
        ctx.clearRect(0, 0, cssW, cssH);
        if (backgroundColor !== "transparent") {
            ctx.fillStyle = resolveColor(backgroundColor, canvas);
            ctx.fillRect(0, 0, cssW, cssH);
        }

        ctx.fillStyle = resolveColor(aliveColor, canvas);

        const grid = gridRef.current;
        // Leave a hairline between live cells so they don't fuse into one blob
        // at small sizes. Work in device pixels and snap to that grid so the
        // line stays crisp at any DPR, and never let the fill drop below a pixel
        // a 1px cell can't be split, so it just stays solid
        const px = 1 / dpr; // one device pixel, in CSS units
        let gap = Math.max(px, Math.round(Math.min(1, cellSize * 0.2) * dpr) / dpr);
        if (cellSize - gap < px) gap = 0;
        const fill = cellSize - gap;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r * cols + c] === 1) {
                    ctx.fillRect(c * cellSize, r * cellSize, fill, fill);
                }
            }
        }
    }, [rows, cols, cellSize, aliveColor, backgroundColor]);

    useEffect(() => {
        gridRef.current = buildScene({ rows, cols }, scene, 2, rlePatterns);
        draw();
    }, [rows, cols, scene, rlePatterns, draw]);

    useEffect(() => {
        if (reducedMotion) return;
        let raf = 0;
        let last = performance.now();
        let accumulator = 0;
        const interval = 1000 / speed;
        const dims: Dimensions = { rows, cols };
        const tick = (now: number): void => {
            raf = requestAnimationFrame(tick);
            accumulator += now - last;
            last = now;
            if (accumulator >= interval) {
                accumulator %= interval;
                gridRef.current = nextGeneration(gridRef.current, dims);
                draw();
            }
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [reducedMotion, speed, rows, cols, draw]);

    return (
        <div className={className} aria-hidden="true">
            <canvas
                ref={canvasRef}
                className="block"
                style={{ pointerEvents: "none", userSelect: "none" }}
            />
        </div>
    );
}