import { colorPatterns } from "./common";

export function isDarkColor(color: string) {
    const getLuminance = (rgb: string) => {
        const match = rgb.match(/\d+/g);
        if (!match || match.length < 3) {
            console.error("Invalid color format:", rgb);
            return 1;
        }
        const [r, g, b] = match.slice(0, 3).map(Number);
        const [red, green, blue] = [r, g, b].map((value) => {
            const channel = value / 255;
            return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    };

    const rgbColor = convertToRGB(color);
    return getLuminance(rgbColor) < 0.5;
}

export function cycleColorFormat(currentColor: string, currentFormat: string, originalNamedColor?: string) {
    const isTransparent = colorPatterns.rgba.test(currentColor) || colorPatterns.hsla.test(currentColor);
    const formats = isTransparent ? ["rgba", "hex", "hsla"] : ["rgb", "hex", "hsl"];

    if (originalNamedColor) {
        formats.push("named");
    }

    const currentIndex = formats.indexOf(currentFormat);
    const nextFormat = formats[(currentIndex + 1) % formats.length];

    /* eslint-disable indent */
    switch (nextFormat) {
        case "rgb":
            return { color: convertToRGB(currentColor), format: "rgb" };
        case "rgba":
            return { color: convertToRGBA(currentColor), format: "rgba" };
        case "hex":
            return { color: convertToHEX(currentColor), format: "hex" };
        case "hsl":
            return { color: convertToHSL(currentColor), format: "hsl" };
        case "hsla":
            return { color: convertToHSLA(currentColor), format: "hsla" };
        case "named":
            return { color: originalNamedColor, format: "named" };
        default:
            return { color: currentColor, format: currentFormat };
    }
    /* eslint-ablene indent */
}

export function convertToRGB(color: string) {
    const dummy = document.createElement("div");
    dummy.style.color = color;
    document.body.appendChild(dummy);
    const computed = window.getComputedStyle(dummy).color;
    document.body.removeChild(dummy);
    return computed;
}

// FIXME..
export function convertToRGBA(color: string) {
    const rgb = convertToRGB(color).match(/\d+/g) as RegExpMatchArray;
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 1)`;
}

export function convertToHEX(color: string) {
    const rgb = convertToRGB(color).match(/\d+/g)?.map(Number) as number[];
    return `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

export function convertToHSL(color: string) {
    const rgb = convertToRGB(color).match(/\d+/g)?.map(Number) as number[];
    const [r, g, b] = rgb.map((value) => value / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    let h, s, l;

    l = (max + min) / 2;

    if (delta === 0) {
        h = s = 0;
    } else {
        s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
        switch (max) {
            case r:
                h = (g - b) / delta + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / delta + 2;
                break;
            case b:
                h = (r - g) / delta + 4;
                break;
        }
        h = Math.round((h as number) * 60);
    }

    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return `hsl(${h}, ${s}%, ${l}%)`;
}

// FIXME..
export function convertToHSLA(color: string, alpha = 1) {
    const rgb = convertToRGB(color).match(/\d+/g)?.map(Number) as number[];
    const [r, g, b] = rgb.map((value) => value / 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    let h, s, l;

    l = (max + min) / 2;

    if (delta === 0) {
        h = s = 0;
    } else {
        s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
        switch (max) {
            case r:
                h = (g - b) / delta + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / delta + 2;
                break;
            case b:
                h = (r - g) / delta + 4;
                break;
        }
        h = Math.round((h as number) * 60);
    }

    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return `hsla(${h}, ${s}%, ${l}%, ${alpha})`;
}

export function generatePalettes(color: string) {
    const palettes: Record<string, string[][]> = {};
    const baseHSL = convertToHSL(color);

    const [h, s, l] = (baseHSL.match(/\d+/g) as RegExpMatchArray).map(Number);

    const interpolateHue = (start: number, end: number, steps: number) => {
        const diff = (end - start + 360) % 360;
        return Array.from(
            { length: steps },
            (_, i) => `hsl(${(start + (diff * (i + 1)) / (steps + 1)) % 360}, ${s}%, ${l}%)`
        );
    };

    const complementaryHue = (h + 180) % 360;
    palettes.complementary = [
        [baseHSL, ...interpolateHue(h, complementaryHue, 3), `hsl(${complementaryHue}, ${s}%, ${l}%)`],
    ];

    const analogousLeft = (h + 30) % 360;
    const analogousRight = (h + 330) % 360;
    palettes.analogous = [
        [
            `hsl(${analogousLeft}, ${s}%, ${l}%)`,
            `hsl(${analogousLeft - 20}, ${s}%, ${l}%)`,
            baseHSL,
            `hsl(${analogousRight + 20}, ${s}%, ${l}%)`,
            `hsl(${analogousRight}, ${s}%, ${l}%)`,
        ],
        [
            `hsl(${analogousLeft}, ${s}%, ${l}%)`,
            `hsl(${h + 20}, ${s}%, ${l}%)`,
            baseHSL,
            `hsl(${h - 20}, ${s}%, ${l}%)`,
            `hsl(${analogousRight}, ${s}%, ${l}%)`,
        ],
    ];

    const triadicLeft = (h + 120) % 360;
    const triadicRight = (h + 240) % 360;
    palettes.triadic = [
        [
            `hsl(${triadicLeft}, ${s}%, ${l}%)`,
            `hsl(${triadicLeft + 20}, ${s}%, ${l}%)`,
            baseHSL,
            `hsl(${triadicRight - 20}, ${s}%, ${l}%)`,
            `hsl(${triadicRight}, ${s}%, ${l}%)`,
        ],
        [
            `hsl(${triadicLeft}, ${s}%, ${l}%)`,
            `hsl(${h + 20}, ${s}%, ${l}%)`,
            baseHSL,
            `hsl(${h - 20}, ${s}%, ${l}%)`,
            `hsl(${triadicRight}, ${s}%, ${l}%)`,
        ],
    ];

    const splitComplementaryLeft = (h + 150) % 360;
    const splitComplementaryRight = (h + 210) % 360;
    palettes.splitComplementary = [
        [
            `hsl(${splitComplementaryLeft}, ${s}%, ${l}%)`,
            `hsl(${splitComplementaryLeft - 20}, ${s}%, ${l}%)`,
            baseHSL,
            `hsl(${splitComplementaryRight + 20}, ${s}%, ${l}%)`,
            `hsl(${splitComplementaryRight}, ${s}%, ${l}%)`,
        ],
        [
            `hsl(${splitComplementaryLeft}, ${s}%, ${l}%)`,
            `hsl(${h - 20}, ${s}%, ${l}%)`,
            baseHSL,
            `hsl(${h + 20}, ${s}%, ${l}%)`,
            `hsl(${splitComplementaryRight}, ${s}%, ${l}%)`,
        ],
        [
            `hsl(${splitComplementaryLeft}, ${s}%, ${l}%)`,
            `hsl(${splitComplementaryLeft + 20}, ${s}%, ${l}%)`,
            baseHSL,
            `hsl(${splitComplementaryRight - 20}, ${s}%, ${l}%)`,
            `hsl(${splitComplementaryRight}, ${s}%, ${l}%)`,
        ],
        [
            `hsl(${splitComplementaryLeft}, ${s}%, ${l}%)`,
            `hsl(${h + 20}, ${s}%, ${l}%)`,
            baseHSL,
            `hsl(${h - 20}, ${s}%, ${l}%)`,
            `hsl(${splitComplementaryRight}, ${s}%, ${l}%)`,
        ],
    ];

    palettes.rectangular = [
        [
            baseHSL,
            `hsl(${(h + 180) % 360}, ${s}%, ${l}%)`,
            `hsl(${(h + 60) % 360}, ${s}%, ${l}%)`,
            `hsl(${(h + 240) % 360}, ${s}%, ${l}%)`,
        ],
    ];

    palettes.square = [
        [
            baseHSL,
            `hsl(${(h + 90) % 360}, ${s}%, ${l}%)`,
            `hsl(${(h + 180) % 360}, ${s}%, ${l}%)`,
            `hsl(${(h + 270) % 360}, ${s}%, ${l}%)`,
        ],
    ];

    palettes.monochromatic = (() => {
        const adjustHue = (amount: number) => (h + amount) % 360;
        const adjustLightness = (amount: number) => Math.min(100, Math.max(0, l + amount));
        const adjustSaturation = (amount: number) => Math.min(100, Math.max(0, s + amount));

        const palette1 = [
            `hsl(${adjustHue(-40)}, ${adjustSaturation(-20)}%, ${adjustLightness(-20)}%)`,
            `hsl(${adjustHue(-20)}, ${adjustSaturation(-10)}%, ${adjustLightness(-10)}%)`,
            baseHSL,
            `hsl(${adjustHue(20)}, ${adjustSaturation(10)}%, ${adjustLightness(10)}%)`,
            `hsl(${adjustHue(40)}, ${adjustSaturation(20)}%, ${adjustLightness(20)}%)`,
        ];

        const palette2 = [
            `hsl(${h}, ${adjustSaturation(-20)}%, ${adjustLightness(-20)}%)`,
            `hsl(${h}, ${adjustSaturation(-10)}%, ${adjustLightness(-10)}%)`,
            baseHSL,
            `hsl(${h}, ${adjustSaturation(10)}%, ${adjustLightness(10)}%)`,
            `hsl(${h}, ${adjustSaturation(20)}%, ${adjustLightness(20)}%)`,
        ];

        const palette3 = [
            `hsl(${adjustHue(40)}, ${adjustSaturation(-20)}%, ${adjustLightness(-20)}%)`,
            `hsl(${adjustHue(20)}, ${adjustSaturation(-10)}%, ${adjustLightness(-10)}%)`,
            baseHSL,
            `hsl(${adjustHue(-20)}, ${adjustSaturation(10)}%, ${adjustLightness(10)}%)`,
            `hsl(${adjustHue(-40)}, ${adjustSaturation(20)}%, ${adjustLightness(20)}%)`,
        ];

        const monochromix = [palette1, palette2, palette3];

        const isValidPalette = (palette: string[]) =>
            palette.every((hsl) => {
                const lightness = parseInt(hsl.match(/(\d+)%\)$/)?.[1] || "0", 10);
                return lightness > 0 && lightness < 100;
            });

        return monochromix.filter(isValidPalette);
    })();

    return palettes;
}
