/*
oscillator definitions
 */

export interface Pattern {
    readonly name: string;
    readonly cells: ReadonlyArray<readonly [number, number]>;
    readonly rows: number;
    readonly cols: number;
    readonly offset: readonly [number, number];
    readonly period: number;
    readonly symmetric: boolean;
}

/* Two L-trominoes blinking in opposite corners. p2. */
const BIPOLE: Pattern = {
    name: "bipole",
    cells: [[0, 0], [0, 1], [1, 0], [2, 3], [3, 2], [3, 3]],
    rows: 4, cols: 4, offset: [0, 0], period: 2, symmetric: false,
};

/* Diagonal pinwheel, flips every tick. p2. */
const CLOCK: Pattern = {
    name: "clock",
    cells: [[0, 2], [1, 0], [1, 2], [2, 1], [2, 3], [3, 1]],
    rows: 4, cols: 4, offset: [0, 0], period: 2, symmetric: false,
};

const PHOENIX1: Pattern = {
    name: "phoenix1",
    cells: [
        [0, 4], [1, 2], [1, 4], [2, 6], [3, 0], [3, 1],
        [4, 6], [4, 7], [5, 1], [6, 3], [6, 5], [7, 3],
    ],
    rows: 8, cols: 8, offset: [0, 0], period: 2, symmetric: false,
};

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

// long and slow
const PENTADECATHLON: Pattern = {
    name: "pentadecathlon",
    cells: [
        [0, 2], [0, 7],
        [1, 0], [1, 1], [1, 3], [1, 4], [1, 5], [1, 6], [1, 8], [1, 9],
        [2, 2], [2, 7],
    ],
    rows: 9, cols: 16, offset: [3, 3], period: 15, symmetric: true,
};

// classic
function buildPulsar(): Pattern {
    const cells: Array<[number, number]> = [];
    for (const r of [0, 5, 7, 12]) for (const c of [2, 3, 4, 8, 9, 10]) cells.push([r, c]);
    for (const r of [2, 3, 4, 8, 9, 10]) for (const c of [0, 5, 7, 12]) cells.push([r, c]);
    return { name: "pulsar", cells, rows: 15, cols: 15, offset: [1, 1], period: 3, symmetric: true };
}
const PULSAR = buildPulsar();

// gosper 1970
const QUEEN_BEE_SHUTTLE: Pattern = {
    name: "queen-bee-shuttle",
    cells: [
        [0, 9], [0, 10], [1, 9], [1, 11], [2, 4], [2, 5], [2, 12], [3, 0],
        [3, 1], [3, 3], [3, 6], [3, 9], [3, 12], [3, 20], [3, 21], [4, 0],
        [4, 1], [4, 4], [4, 5], [4, 12], [4, 20], [4, 21], [5, 9], [5, 11],
        [6, 9], [6, 10],
    ],
    rows: 7, cols: 22, offset: [0, 0], period: 30, symmetric: false,
};

// gosper 1971
const TWIN_BEES_SHUTTLE: Pattern = {
    name: "twin-bees-shuttle",
    cells: [
        [0, 17], [1, 0], [1, 1], [1, 17], [1, 18], [1, 27], [1, 28], [2, 0],
        [2, 1], [2, 18], [2, 19], [2, 27], [2, 28], [3, 13], [3, 14], [3, 17],
        [3, 18], [7, 13], [7, 14], [7, 17], [7, 18], [8, 0], [8, 1], [8, 18],
        [8, 19], [8, 27], [8, 28], [9, 0], [9, 1], [9, 17], [9, 18], [9, 27],
        [9, 28], [10, 17],
    ],
    rows: 13, cols: 29, offset: [1, 0], period: 46, symmetric: false,
};

export const PATTERNS = {
    blinker: BLINKER,
    toad: TOAD,
    beacon: BEACON,
    octagon: OCTAGON,
    "figure-eight": FIGURE_EIGHT,
    pentadecathlon: PENTADECATHLON,
    pulsar: PULSAR,
    clock: CLOCK,
    bipole: BIPOLE,
    phoenix1: PHOENIX1,
    "queen-bee-shuttle": QUEEN_BEE_SHUTTLE,
    "twin-bees-shuttle": TWIN_BEES_SHUTTLE,
} as const;

export type PatternName = keyof typeof PATTERNS;
export type Scene = PatternName | "symmetric" | "mixed";

export function patternsForScene(scene: Scene): Pattern[] {
    if (scene === "symmetric") return [OCTAGON, PULSAR, FIGURE_EIGHT];
    if (scene === "mixed")
        return [PULSAR, OCTAGON, PENTADECATHLON, FIGURE_EIGHT, BEACON, BLINKER];
    return [PATTERNS[scene]];
}