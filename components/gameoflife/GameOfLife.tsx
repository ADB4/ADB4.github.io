import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Grid = Uint8Array;

interface Dimensions {
    readonly rows: number;
    readonly cols: number;
}

const index = (r: number, c: number, cols: number): number => r * cols + c;

function borderStep(
    prev: Grid,
    next: Grid,
    rows: number,
    cols: number,
    r: number,
    c: number,
    tracked: boolean,
): void {
    let n = 0;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
            if (prev[nr * cols + nc] !== 0) n++;
        }
    }
    const i = r * cols + c;
    const prevV = prev[i];
    const alive = prevV !== 0;
    const survives = alive ? n === 2 || n === 3 : n === 3;
    next[i] = survives
        ? tracked
            ? alive
                ? Math.min(255, prevV + 1)
                : 1
            : 1
        : 0;
}

function stepInto(prev: Grid, next: Grid, dims: Dimensions, tracked: boolean): void {
    const { rows, cols } = dims;

    if (rows >= 3 && cols >= 3) {
        for (let r = 1; r < rows - 1; r++) {
            const above = (r - 1) * cols;
            const here = r * cols;
            const below = (r + 1) * cols;
            for (let c = 1; c < cols - 1; c++) {
                const n =
                    (prev[above + c - 1] !== 0 ? 1 : 0) +
                    (prev[above + c    ] !== 0 ? 1 : 0) +
                    (prev[above + c + 1] !== 0 ? 1 : 0) +
                    (prev[here  + c - 1] !== 0 ? 1 : 0) +
                    (prev[here  + c + 1] !== 0 ? 1 : 0) +
                    (prev[below + c - 1] !== 0 ? 1 : 0) +
                    (prev[below + c    ] !== 0 ? 1 : 0) +
                    (prev[below + c + 1] !== 0 ? 1 : 0);
                const i = here + c;
                const prevV = prev[i];
                const alive = prevV !== 0;
                const survives = alive ? n === 2 || n === 3 : n === 3;
                next[i] = survives
                    ? tracked
                        ? alive
                            ? Math.min(255, prevV + 1)
                            : 1
                        : 1
                    : 0;
            }
        }
    }

    if (rows >= 1) {
        for (let c = 0; c < cols; c++) borderStep(prev, next, rows, cols, 0, c, tracked);
    }
    if (rows >= 2) {
        for (let c = 0; c < cols; c++) borderStep(prev, next, rows, cols, rows - 1, c, tracked);
    }
    for (let r = 1; r < rows - 1; r++) {
        borderStep(prev, next, rows, cols, r, 0, tracked);
        if (cols >= 2) borderStep(prev, next, rows, cols, r, cols - 1, tracked);
    }
}

function nextGeneration(grid: Grid, dims: Dimensions): Grid {
    const next = new Uint8Array(dims.rows * dims.cols);
    stepInto(grid, next, dims, false);
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

type GradientEasing = "linear" | "ease-in" | "ease-out" | "ease-in-out";

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
        else if (max === gn) h = (bn - rn) / d + 2;
        else h = (rn - gn) / d + 4;
        h *= 60;
    }
    return [h, s * 100, l * 100];
}

function parseToHsl(value: string, el: Element): [number, number, number] {
    const resolved = resolveColor(value, el).trim();
    let m = resolved.match(/^#([0-9a-fA-F]{3})$/);
    if (m) {
        const r = parseInt(m[1][0] + m[1][0], 16);
        const g = parseInt(m[1][1] + m[1][1], 16);
        const b = parseInt(m[1][2] + m[1][2], 16);
        return rgbToHsl(r, g, b);
    }
    m = resolved.match(/^#([0-9a-fA-F]{6})$/);
    if (m) {
        const r = parseInt(m[1].slice(0, 2), 16);
        const g = parseInt(m[1].slice(2, 4), 16);
        const b = parseInt(m[1].slice(4, 6), 16);
        return rgbToHsl(r, g, b);
    }
    m = resolved.match(/^rgba?\(\s*([\d.]+)\s*[, ]\s*([\d.]+)\s*[, ]\s*([\d.]+)/i);
    if (m) return rgbToHsl(parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]));
    m = resolved.match(/^hsla?\(\s*([\d.]+)(?:deg)?\s*[, ]\s*([\d.]+)%\s*[, ]\s*([\d.]+)%/i);
    if (m) return [parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3])];
    return [0, 0, 0];
}

function hslLerp(
    a: [number, number, number],
    b: [number, number, number],
    t: number,
): [number, number, number] {
    const delta = ((b[0] - a[0] + 540) % 360) - 180;
    const h = (a[0] + delta * t + 360) % 360;
    const s = a[1] + (b[1] - a[1]) * t;
    const l = a[2] + (b[2] - a[2]) * t;
    return [h, s, l];
}

function applyEasing(t: number, kind: GradientEasing): number {
    switch (kind) {
        case "ease-in": return t * t;
        case "ease-out": return 1 - (1 - t) * (1 - t);
        case "ease-in-out": return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
        default: return t;
    }
}

function makeSprite(size: number, radius: number, color: string, dpr: number): HTMLCanvasElement {
    const cv = document.createElement("canvas");
    cv.width = Math.max(1, Math.round(size * dpr));
    cv.height = Math.max(1, Math.round(size * dpr));
    const cctx = cv.getContext("2d");
    if (!cctx) return cv;
    cctx.scale(dpr, dpr);
    cctx.fillStyle = color;
    if (radius > 0 && typeof cctx.roundRect === "function") {
        cctx.beginPath();
        cctx.roundRect(0, 0, size, size, radius);
        cctx.fill();
    } else {
        cctx.fillRect(0, 0, size, size);
    }
    return cv;
}

interface AliveGradient {
    stops: string[];
    maxAge?: number;
    easing?: GradientEasing;
}

interface LifeOscillatorsProps {
    rows?: number;
    cols?: number;
    cellSize?: number;
    speed?: number;
    scene?: Scene;
    rle?: string | string[];
    aliveColor?: string;
    aliveGradient?: AliveGradient;
    backgroundColor?: string;
    cellRadius?: number;
    rowOffset?: number;
    colOffset?: number;
    className?: string;
}

interface SpriteCache {
    key: string;
    sprites: HTMLCanvasElement[];
}

export default function LifeOscillators({
                                            rows = 16,
                                            cols = 16,
                                            cellSize = 12,
                                            speed = 6,
                                            scene = "symmetric",
                                            rle,
                                            aliveColor = "var(--text-primary)",
                                            aliveGradient,
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
    const backRef = useRef<Grid>(new Uint8Array(rows * cols));
    const spriteCacheRef = useRef<SpriteCache | null>(null);
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

        const useGradient = !!aliveGradient && aliveGradient.stops.length > 0;
        const maxAge = useGradient
            ? Math.max(1, Math.min(255, aliveGradient!.maxAge ?? 12))
            : 1;

        let lut: string[] | null = null;
        if (useGradient) {
            const stops = aliveGradient!.stops;
            const easing: GradientEasing = aliveGradient!.easing ?? "linear";
            const hslStops = stops.map((s) => parseToHsl(s, canvas));
            const segCount = hslStops.length - 1;
            lut = new Array(maxAge + 1);
            for (let age = 1; age <= maxAge; age++) {
                const rawT = maxAge > 1 ? (age - 1) / (maxAge - 1) : 0;
                const t = applyEasing(rawT, easing);
                if (segCount <= 0) {
                    const c0 = hslStops[0];
                    lut[age] = `hsl(${c0[0]}, ${c0[1]}%, ${c0[2]}%)`;
                } else {
                    const segPos = t * segCount;
                    const segIdx = Math.min(segCount - 1, Math.floor(segPos));
                    const localT = segPos - segIdx;
                    const c0 = hslLerp(hslStops[segIdx], hslStops[segIdx + 1], localT);
                    lut[age] = `hsl(${c0[0]}, ${c0[1]}%, ${c0[2]}%)`;
                }
            }
        }

        const inset = cellSize > 4 ? 1 : 0;
        const size = cellSize - inset * 2;
        const pxRadius = (radius01 * size) / 2;
        const rounded = pxRadius > 0;

        const solidColor = useGradient ? null : resolveColor(aliveColor, canvas);
        const colors = useGradient ? lut!.slice(1) : [solidColor!];

        let sprites: HTMLCanvasElement[] | null = null;
        if (rounded) {
            const key = `${size}|${pxRadius}|${dpr}|${colors.join("\u0001")}`;
            const cache = spriteCacheRef.current;
            if (cache && cache.key === key) {
                sprites = cache.sprites;
            } else {
                sprites = colors.map((color) => makeSprite(size, pxRadius, color, dpr));
                spriteCacheRef.current = { key, sprites };
            }
        }

        const grid = gridRef.current;

        if (useGradient) {
            const buckets: number[][] = new Array(maxAge);
            for (let i = 0; i < maxAge; i++) buckets[i] = [];

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const v = grid[r * cols + c];
                    if (v === 0) continue;
                    const ageIdx = Math.min(maxAge, v) - 1;
                    const x = originX + c * cellSize + r * effRowOffset + inset;
                    const y = originY + r * cellSize + c * effColOffset + inset;
                    const b = buckets[ageIdx];
                    b.push(x, y);
                }
            }

            for (let ageIdx = 0; ageIdx < maxAge; ageIdx++) {
                const coords = buckets[ageIdx];
                if (coords.length === 0) continue;
                if (rounded) {
                    const sprite = sprites![ageIdx];
                    for (let k = 0; k < coords.length; k += 2) {
                        ctx.drawImage(sprite, coords[k], coords[k + 1], size, size);
                    }
                } else {
                    ctx.fillStyle = lut![ageIdx + 1];
                    for (let k = 0; k < coords.length; k += 2) {
                        ctx.fillRect(coords[k], coords[k + 1], size, size);
                    }
                }
            }
        } else if (rounded) {
            const sprite = sprites![0];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (grid[r * cols + c] === 0) continue;
                    const x = originX + c * cellSize + r * effRowOffset + inset;
                    const y = originY + r * cellSize + c * effColOffset + inset;
                    ctx.drawImage(sprite, x, y, size, size);
                }
            }
        } else {
            ctx.fillStyle = solidColor!;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (grid[r * cols + c] === 0) continue;
                    const x = originX + c * cellSize + r * effRowOffset + inset;
                    const y = originY + r * cellSize + c * effColOffset + inset;
                    ctx.fillRect(x, y, size, size);
                }
            }
        }
    }, [rows, cols, cellSize, aliveColor, aliveGradient, backgroundColor, cellRadius, rowOffset, colOffset]);

    useEffect(() => {
        gridRef.current = buildScene({ rows, cols }, scene, 2, rlePatterns);
        if (backRef.current.length !== rows * cols) {
            backRef.current = new Uint8Array(rows * cols);
        } else {
            backRef.current.fill(0);
        }
        spriteCacheRef.current = null;
        draw();
    }, [rows, cols, scene, rlePatterns, draw]);

    useEffect(() => {
        if (reducedMotion) return;
        const useGradient = !!aliveGradient && aliveGradient.stops.length > 0;
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
                stepInto(gridRef.current, backRef.current, dims, useGradient);
                const tmp = gridRef.current;
                gridRef.current = backRef.current;
                backRef.current = tmp;
                draw();
            }
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [reducedMotion, speed, rows, cols, draw, aliveGradient]);

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