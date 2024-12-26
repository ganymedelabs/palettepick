import { colorPatterns } from "./common";

export function cycleColorFormat(currentColor: string, currentFormat: string, originalNamedColor?: string) {
    const isTransparent = colorPatterns.rgba.test(currentColor) || colorPatterns.hsla.test(currentColor);
    const formats = isTransparent ? ["rgb", "rgba", "hex", "hsl", "hsla"] : ["rgb", "hex", "hsl"];

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
