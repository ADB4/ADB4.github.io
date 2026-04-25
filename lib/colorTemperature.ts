/**
 * colortemperature.ts
 *
 * Attempt at converting color temperature (Kelvin) to RGB values.
 * Based on Tanner Helland's algorithm, with clamping and
 * inversion for light-mode backlight simulation.
 *
 * Placement: lib/colortemperature.ts
 */

export interface RGB {
    r: number;
    g: number;
    b: number;
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/**
 * Convert a color temperature in Kelvin to an RGB triplet.
 * Valid range: roughly 1000K - 40000K.
 *
 * At 6500K you get near-white (D65 illuminant).
 * Below 6500K shifts warm (amber/red).
 * Above 6500K shifts cool (blue).
 */
export function kelvinToRGB(kelvin: number): RGB {
    const temp = clamp(kelvin, 1000, 40000) / 100;

    let r: number;
    let g: number;
    let b: number;

    // Red
    if (temp <= 66) {
        r = 255;
    } else {
        r = temp - 60;
        r = 329.698727446 * Math.pow(r, -0.1332047592);
        r = clamp(r, 0, 255);
    }

    // Green
    if (temp <= 66) {
        g = temp;
        g = 99.4708025861 * Math.log(g) - 161.1195681661;
        g = clamp(g, 0, 255);
    } else {
        g = temp - 60;
        g = 288.1221695283 * Math.pow(g, -0.0755148492);
        g = clamp(g, 0, 255);
    }

    // Blue
    if (temp >= 66) {
        b = 255;
    } else if (temp <= 19) {
        b = 0;
    } else {
        b = temp - 10;
        b = 138.5177312231 * Math.log(b) - 305.0447927307;
        b = clamp(b, 0, 255);
    }

    return {
        r: Math.round(r),
        g: Math.round(g),
        b: Math.round(b),
    };
}

/**
 * For light-mode "inverted" backlight, we need the cells to darken
 * (cast shadow) rather than brighten. This inverts the RGB values
 * so the "lit" color becomes a dark tint instead of a bright glow.
 */
export function invertRGB(color: RGB): RGB {
    return {
        r: 255 - color.r,
        g: 255 - color.g,
        b: 255 - color.b,
    };
}

/**
 * Format an RGB value to a CSS rgba() string at the given opacity.
 */
export function rgbToCSS(color: RGB, alpha: number = 1): string {
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}