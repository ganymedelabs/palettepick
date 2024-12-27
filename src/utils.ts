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
    const palettes: string[][] = [];
    const baseHSL = convertToHSL(color);

    // Extract H, S, L values
    const [h, s, l] = (baseHSL.match(/\d+/g) as RegExpMatchArray).map(Number);

    // Complementary
    const complementary = [`hsl(${(h + 180) % 360}, ${s}%, ${l}%)`];
    palettes.push(complementary);

    // Analogous
    const analogous = [`hsl(${(h + 30) % 360}, ${s}%, ${l}%)`, `hsl(${(h + 330) % 360}, ${s}%, ${l}%)`];
    palettes.push(analogous);

    // Triadic
    const triadic = [`hsl(${(h + 120) % 360}, ${s}%, ${l}%)`, `hsl(${(h + 240) % 360}, ${s}%, ${l}%)`];
    palettes.push(triadic);

    // Split-Complementary
    const splitComplementary = [`hsl(${(h + 150) % 360}, ${s}%, ${l}%)`, `hsl(${(h + 210) % 360}, ${s}%, ${l}%)`];
    palettes.push(splitComplementary);

    // Rectangular (Tetradic)
    const rectangular = [`hsl(${(h + 90) % 360}, ${s}%, ${l}%)`, `hsl(${(h + 270) % 360}, ${s}%, ${l}%)`];
    palettes.push(rectangular);

    // Square
    const square = [
        `hsl(${(h + 90) % 360}, ${s}%, ${l}%)`,
        `hsl(${(h + 180) % 360}, ${s}%, ${l}%)`,
        `hsl(${(h + 270) % 360}, ${s}%, ${l}%)`,
    ];
    palettes.push(square);

    // Convert HSL to HEX for consistent output
    return palettes.map((group) => group.map((color) => convertToHEX(color)));
}
