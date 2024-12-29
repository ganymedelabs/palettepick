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

export async function generatePalettes(color: string): Promise<string[][]> {
    const palettes: string[][] = [];
    const baseHSL = convertToHSL(color);

    const [h, s, l] = (baseHSL.match(/\d+/g) as RegExpMatchArray).map(Number);

    // Premade Palettes
    const palettesJson = await (async () => {
        const url = chrome.runtime.getURL("json/palettes.json");
        const response = await fetch(url);
        const palettesJson = await response.json();
        return palettesJson as string[][];
    })();
    palettes.push(...palettesJson.filter((palette: string[]) => palette.includes(convertToHEX(baseHSL))));

    if (s < 25 || l > 90 || l < 20) return palettes;

    const interpolateMix = (startColor: string, endColor: string, steps: number): string[] => {
        const startRGB = convertToRGB(startColor).match(/\d+/g)?.map(Number) as number[];
        const endRGB = convertToRGB(endColor).match(/\d+/g)?.map(Number) as number[];

        const result: string[] = [];

        for (let i = 1; i <= steps; i++) {
            const t = i / (steps + 1);

            const r = Math.round(startRGB[0] + t * (endRGB[0] - startRGB[0]));
            const g = Math.round(startRGB[1] + t * (endRGB[1] - startRGB[1]));
            const b = Math.round(startRGB[2] + t * (endRGB[2] - startRGB[2]));

            result.push(convertToHSL(`rgb(${r}, ${g}, ${b})`));
        }

        return result;
    };

    const random = <T>(...args: T[]): T => {
        const randomIndex = Math.floor(Math.random() * args.length);
        return args[randomIndex];
    };

    // Complementary
    const complementaryHue = (h + 180) % 360;
    const complementaryColor = `hsl(${complementaryHue}, ${s}%, ${l}%)`;
    palettes.push([baseHSL, ...interpolateMix(baseHSL, complementaryColor, 3), complementaryColor]);

    // Analogous
    const analogousLeft = `hsl(${(h + 30) % 360}, ${s}%, ${l}%)`;
    const analogousRight = `hsl(${(h + 330) % 360}, ${s}%, ${l}%)`;
    palettes.push([
        analogousLeft,
        ...interpolateMix(analogousLeft, baseHSL, 1),
        baseHSL,
        ...interpolateMix(baseHSL, analogousRight, 1),
        analogousRight,
    ]);

    // Triadic
    const triadicLeft = (h + 240) % 360;
    const triadicRight = (h + 120) % 360;
    palettes.push(
        (() => {
            if (l > 60 || l < 20) {
                return [
                    `hsl(${triadicLeft + 20}, ${s}%, ${l}%)`,
                    `hsl(${triadicLeft}, ${s}%, ${l}%)`,
                    `hsl(${triadicRight}, ${s}%, ${l}%)`,
                    `hsl(${triadicRight - 20}, ${s}%, ${l}%)`,
                    baseHSL,
                ];
            }
            return random(
                [
                    baseHSL,
                    `hsl(${triadicLeft}, 80%, ${l - 30}%)`,
                    `hsl(${triadicLeft}, ${s}%, ${l}%)`,
                    `hsl(${triadicRight}, ${s}%, ${l}%)`,
                    `hsl(${triadicRight}, 80%, ${l - 30}%)`,
                ],
                [
                    baseHSL,
                    `hsl(${triadicLeft}, 80%, 20%)`,
                    `hsl(${triadicLeft}, ${s}%, ${l}%)`,
                    `hsl(${triadicRight}, 40%, 80%)`,
                    `hsl(${triadicLeft}, 40%, 80%)`,
                ]
            );
        })()
    );

    // Split-Complementary
    const splitComplementaryLeft = (complementaryHue + 20) % 360;
    const splitComplementaryRight = (complementaryHue - 20) % 360;
    palettes.push(
        (() => {
            const anchor = random("base", "splitComplementary");

            if (l > 60 || l < 20) {
                return [
                    `hsl(${splitComplementaryLeft}, ${l - 20}%, ${l - 20}%)`,
                    `hsl(${splitComplementaryLeft}, ${l}%, ${l + 10}%)`,
                    baseHSL,
                    `hsl(${splitComplementaryRight}, ${l}%, ${l + 10}%)`,
                    `hsl(${splitComplementaryRight}, ${l - 20}%, ${l - 20}%)`,
                ];
            }

            if (anchor === "base") {
                return random(
                    [
                        `hsl(${h + 20}, ${s}%, ${l}%)`,
                        baseHSL,
                        `hsl(${h - 20}, ${s}%, ${l}%)`,
                        `hsl(${splitComplementaryLeft}, ${s - 20}%, ${l + 10}%)`,
                        `hsl(${splitComplementaryRight}, ${s - 20}%, ${l + 10}%)`,
                    ],
                    [
                        `hsl(${h}, ${s}%, ${l + 20}%)`,
                        baseHSL,
                        `hsl(${h - 20}, ${s}%, ${l}%)`,
                        `hsl(${splitComplementaryLeft}, ${s - 20}%, ${l + 10}%)`,
                        `hsl(${splitComplementaryRight}, ${s - 20}%, ${l + 10}%)`,
                    ]
                );
            }

            return random(
                [
                    `hsl(${splitComplementaryLeft + 20}, ${s}%, ${l}%)`,
                    `hsl(${splitComplementaryLeft}, ${s - 20}%, ${l + 20}%)`,
                    baseHSL,
                    `hsl(${splitComplementaryRight}, ${s - 20}%, ${l + 20}%)`,
                    `hsl(${splitComplementaryRight + -20}, ${s}%, ${l}%)`,
                ],
                [
                    `hsl(${splitComplementaryLeft}, ${s}%, ${l}%)`,
                    `hsl(${splitComplementaryLeft - 20}, ${s}%, ${l}%)`,
                    `hsl(${splitComplementaryRight + 20}, ${s}%, ${l}%)`,
                    `hsl(${splitComplementaryRight}, ${s}%, ${l}%)`,
                    baseHSL,
                ]
            );
        })()
    );

    // Rectangular
    palettes.push([
        baseHSL,
        `hsl(${(h + 180) % 360}, ${s}%, ${l}%)`,
        `hsl(${(h + 60) % 360}, ${s}%, ${l}%)`,
        `hsl(${(h + 240) % 360}, ${s}%, ${l}%)`,
    ]);

    // Square
    palettes.push([
        baseHSL,
        `hsl(${(h + 90) % 360}, ${s}%, ${l}%)`,
        `hsl(${(h + 180) % 360}, ${s}%, ${l}%)`,
        `hsl(${(h + 270) % 360}, ${s}%, ${l}%)`,
    ]);

    // Monochromic
    palettes.push(
        (() => {
            const adjustHue = (amount: number) => (h + amount) % 360;
            const adjustLightness = (amount: number) => Math.min(100, Math.max(0, l + amount));
            const adjustSaturation = (amount: number) => Math.min(100, Math.max(0, s + amount));

            const direction = random("positive", "negative");
            const anchor = random("base", "monochromic");
            if (l < 70 && l > 30) {
                if (s < 50) {
                    return [
                        baseHSL,
                        `hsl(${anchor === "base" ? h : adjustHue(direction === "positive" ? 10 : -10)}, ${adjustSaturation(10)}%, ${l}%)`,
                        `hsl(${anchor === "base" ? h : adjustHue(direction === "positive" ? 20 : -20)}, ${adjustSaturation(20)}%, ${l}%)`,
                        `hsl(${anchor === "base" ? h : adjustHue(direction === "positive" ? 30 : -30)}, ${adjustSaturation(30)}%, ${l}%)`,
                        `hsl(${anchor === "base" ? h : adjustHue(direction === "positive" ? 40 : -40)}, ${adjustSaturation(40)}%, ${l}%)`,
                    ];
                }
                return [
                    baseHSL,
                    `hsl(${anchor === "base" ? h : adjustHue(direction === "positive" ? 10 : -10)}, ${adjustSaturation(-10)}%, ${l}%)`,
                    `hsl(${anchor === "base" ? h : adjustHue(direction === "positive" ? 20 : -20)}, ${adjustSaturation(-20)}%, ${l}%)`,
                    `hsl(${anchor === "base" ? h : adjustHue(direction === "positive" ? 30 : -30)}, ${adjustSaturation(-30)}%, ${l}%)`,
                    `hsl(${anchor === "base" ? h : adjustHue(direction === "positive" ? 40 : -40)}, ${adjustSaturation(-40)}%, ${l}%)`,
                ];
            }
            if (l < 70) {
                if (s < 50) {
                    return [
                        baseHSL,
                        `hsl(${anchor === "base" ? h : adjustHue(direction === "positive" ? 10 : -10)}, ${adjustSaturation(10)}%, ${adjustLightness(10)}%)`,
                        `hsl(${anchor === "base" ? h : adjustHue(direction === "positive" ? 20 : -20)}, ${adjustSaturation(20)}%, ${adjustLightness(20)}%)`,
                        `hsl(${anchor === "base" ? h : adjustHue(direction === "positive" ? 30 : -30)}, ${adjustSaturation(30)}%, ${adjustLightness(30)}%)`,
                        `hsl(${anchor === "base" ? h : adjustHue(direction === "positive" ? 40 : -40)}, ${adjustSaturation(40)}%, ${adjustLightness(40)}%)`,
                    ];
                }
                return [
                    baseHSL,
                    `hsl(${anchor === "base" ? h : adjustHue(direction === "positive" ? 10 : -10)}, ${adjustSaturation(-10)}%, ${adjustLightness(10)}%)`,
                    `hsl(${anchor === "base" ? h : adjustHue(direction === "positive" ? 20 : -20)}, ${adjustSaturation(-20)}%, ${adjustLightness(20)}%)`,
                    `hsl(${anchor === "base" ? h : adjustHue(direction === "positive" ? 30 : -30)}, ${adjustSaturation(-30)}%, ${adjustLightness(30)}%)`,
                    `hsl(${anchor === "base" ? h : adjustHue(direction === "positive" ? 40 : -40)}, ${adjustSaturation(-40)}%, ${adjustLightness(40)}%)`,
                ];
            }
            if (s < 30) {
                return [
                    baseHSL,
                    `hsl(${anchor === "base" ? h : adjustHue(direction === "positive" ? 10 : -10)}, ${adjustSaturation(10)}%, ${adjustLightness(-10)}%)`,
                    `hsl(${anchor === "base" ? h : adjustHue(direction === "positive" ? 20 : -20)}, ${adjustSaturation(20)}%, ${adjustLightness(-20)}%)`,
                    `hsl(${anchor === "base" ? h : adjustHue(direction === "positive" ? 30 : -30)}, ${adjustSaturation(30)}%, ${adjustLightness(-30)}%)`,
                    `hsl(${anchor === "base" ? h : adjustHue(direction === "positive" ? 40 : -40)}, ${adjustSaturation(40)}%, ${adjustLightness(-40)}%)`,
                ];
            }
            return [
                baseHSL,
                `hsl(${anchor === "base" ? h : adjustHue(direction === "positive" ? 10 : -10)}, ${adjustSaturation(-20)}%, ${adjustLightness(-10)}%)`,
                `hsl(${anchor === "base" ? h : adjustHue(direction === "positive" ? 20 : -20)}, ${adjustSaturation(-10)}%, ${adjustLightness(-20)}%)`,
                `hsl(${anchor === "base" ? h : adjustHue(direction === "positive" ? 30 : -30)}, ${adjustSaturation(-30)}%, ${adjustLightness(-30)}%)`,
                `hsl(${anchor === "base" ? h : adjustHue(direction === "positive" ? 40 : -40)}, ${adjustSaturation(-40)}%, ${adjustLightness(-40)}%)`,
            ];
        })()
    );

    return palettes;
}
