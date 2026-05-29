import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            count += grid[index(nr, nc, cols)];
        }
    }
    return count;
}

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

interface Pattern {
    readonly name: string;
    readonly cells: ReadonlyArray<readonly [number, number]>;
    readonly rows: number;
    readonly cols: number;
    readonly offset: readonly [number, number];
    readonly period: number;
    readonly symmetric: boolean;
}

const BLINKER: Pattern = {
    name: "blinker",
    cells: [[1, 0], [1, 1], [1, 2]],
    rows: 3, cols: 3, offset: [0, 0], period: 2, symmetric: false,
};

const TOAD: Pattern = {
    name: "toad",
    cells: [[1, 1], [1, 2], [1, 3], [2, 0], [2, 1], [2, 2]],
    rows: 4, cols: 4, offset: [0, 0], period: 2, symmetric: false,
};

const BEACON: Pattern = {
    name: "beacon",
    cells: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 2], [2, 3], [3, 2], [3, 3]],
    rows: 4, cols: 4, offset: [0, 0], period: 2, symmetric: false,
};

const OCTAGON: Pattern = {
    name: "octagon",
    cells: [
        [0, 3], [0, 4], [1, 2], [1, 5], [2, 1], [2, 6], [3, 0], [3, 7],
        [4, 0], [4, 7], [5, 1], [5, 6], [6, 2], [6, 5], [7, 3], [7, 4],
    ],
    rows: 8, cols: 8, offset: [0, 0], period: 5, symmetric: true,
};

const FIGURE_EIGHT: Pattern = {
    name: "figure-eight",
    cells: [
        [0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2],
        [3, 3], [3, 4], [3, 5], [4, 3], [4, 4], [4, 5], [5, 3], [5, 4], [5, 5],
    ],
    rows: 10, cols: 10, offset: [2, 2], period: 8, symmetric: true,
};

const PENTADECATHLON: Pattern = {
    name: "pentadecathlon",
    cells: [
        [0, 2], [0, 7],
        [1, 0], [1, 1], [1, 3], [1, 4], [1, 5], [1, 6], [1, 8], [1, 9],
        [2, 2], [2, 7],
    ],
    rows: 9, cols: 16, offset: [3, 3], period: 15, symmetric: true,
};

function buildPulsar(): Pattern {
    const cells: Array<[number, number]> = [];
    for (const r of [0, 5, 7, 12]) for (const c of [2, 3, 4, 8, 9, 10]) cells.push([r, c]);
    for (const r of [2, 3, 4, 8, 9, 10]) for (const c of [0, 5, 7, 12]) cells.push([r, c]);
    return { name: "pulsar", cells, rows: 15, cols: 15, offset: [1, 1], period: 3, symmetric: true };
}
const PULSAR = buildPulsar();

const PATTERNS = {
    blinker: BLINKER,
    toad: TOAD,
    beacon: BEACON,
    octagon: OCTAGON,
    "figure-eight": FIGURE_EIGHT,
    pentadecathlon: PENTADECATHLON,
    pulsar: PULSAR,
} as const;

type PatternName = keyof typeof PATTERNS;
type Scene = PatternName | "symmetric" | "mixed";

function patternsForScene(scene: Scene): Pattern[] {
    if (scene === "symmetric") return [OCTAGON, PULSAR, FIGURE_EIGHT];
    if (scene === "mixed")
        return [PULSAR, OCTAGON, PENTADECATHLON, FIGURE_EIGHT, BEACON, BLINKER];
    return [PATTERNS[scene]];
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

    const minSeedR = Math.min(...cells.map(([r]) => r));
    const minSeedC = Math.min(...cells.map(([, c]) => c));
    const seed = cells.map(([r, c]) => [r - minSeedR, c - minSeedC] as [number, number]);
    const seedH = Math.max(...seed.map(([r]) => r)) + 1;
    const seedW = Math.max(...seed.map(([, c]) => c)) + 1;

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

function resolveColor(value: string, el: Element): string {
    if (!value.includes("var(")) return value;
    const match = value.match(/var\(\s*(--[\w-]+)\s*(?:,\s*([^)]+))?\)/);
    if (!match) return value;
    const [, name, fallback] = match;
    const resolved = getComputedStyle(el).getPropertyValue(name).trim();
    return resolved || fallback?.trim() || value;
}

interface LifeOscillatorsProps {
    rows?: number;
    cols?: number;
    cellSize?: number;
    speed?: number;
    scene?: Scene;
    rle?: string | string[];
    aliveColor?: string;
    backgroundColor?: string;
    cellRadius?: number;
    rowOffset?: number;
    colOffset?: number;
    className?: string;
}

export default function LifeOscillators({
                                            rows = 16,
                                            cols = 16,
                                            cellSize = 12,
                                            speed = 6,
                                            scene = "symmetric",
                                            rle,
                                            aliveColor = "var(--text-primary)",
                                            backgroundColor = "transparent",
                                            cellRadius = 0.75,
                                            rowOffset = 0,
                                            colOffset = 0,
                                            className,
                                        }: LifeOscillatorsProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

        const radius01 = Math.min(1, Math.max(0, cellRadius));
        let effRowOffset = rowOffset;
        let effColOffset = colOffset;
        if (effRowOffset !== 0 && effColOffset !== 0) {
            if (typeof console !== "undefined") {
                console.warn(
                    "[LifeOscillators] rowOffset and colOffset are mutually " +
                    "exclusive; using rowOffset and ignoring colOffset.",
                );
            }
            effColOffset = 0;
        }

        const shearX = (rows - 1) * effRowOffset;
        const shearY = (cols - 1) * effColOffset;
        const originX = shearX < 0 ? -shearX : 0;
        const originY = shearY < 0 ? -shearY : 0;

        const dpr = window.devicePixelRatio || 1;
        const cssW = cols * cellSize + Math.abs(shearX);
        const cssH = rows * cellSize + Math.abs(shearY);
        if (canvas.width !== cssW * dpr || canvas.height !== cssH * dpr) {
            canvas.width = cssW * dpr;
            canvas.height = cssH * dpr;
            canvas.style.width = `${cssW}px`;
            canvas.style.height = `${cssH}px`;
        }

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, cssW, cssH);
        if (backgroundColor !== "transparent") {
            ctx.fillStyle = resolveColor(backgroundColor, canvas);
            ctx.fillRect(0, 0, cssW, cssH);
        }

        ctx.fillStyle = resolveColor(aliveColor, canvas);

        const grid = gridRef.current;
        const inset = cellSize > 4 ? 1 : 0;
        const size = cellSize - inset * 2;
        const pxRadius = (radius01 * size) / 2;
        const rounded = pxRadius > 0;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r * cols + c] !== 1) continue;
                const x = originX + c * cellSize + r * effRowOffset + inset;
                const y = originY + r * cellSize + c * effColOffset + inset;
                if (!rounded) {
                    ctx.fillRect(x, y, size, size);
                } else {
                    ctx.beginPath();
                    ctx.roundRect(x, y, size, size, pxRadius);
                    ctx.fill();
                }
            }
        }
    }, [rows, cols, cellSize, aliveColor, backgroundColor, cellRadius, rowOffset, colOffset]);

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