import { colorPatterns } from "./common";
import { cycleColorFormat, convertToRGB } from "./utils";

function getLuminance(color: string) {
    const match = color.match(/\d+/g);
    if (!match || match.length < 3) {
        console.error("Invalid color format:", color);
        return 1;
    }
    const [r, g, b] = match.slice(0, 3).map(Number);
    const [red, green, blue] = [r, g, b].map((value) => {
        const channel = value / 255;
        return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function isDarkColor(color: string) {
    const rgbColor = convertToRGB(color);
    return getLuminance(rgbColor) < 0.5;
}

function parseColor(matchText: string): string {
    let color: string;

    if (matchText.startsWith("#")) {
        /* eslint-disable indent */
        color =
            matchText.length === 4
                ? `rgb(${parseInt(matchText[1] + matchText[1], 16)}, ${parseInt(
                      matchText[2] + matchText[2],
                      16
                  )}, ${parseInt(matchText[3] + matchText[3], 16)})`
                : `rgb(${parseInt(matchText.slice(1, 3), 16)}, ${parseInt(matchText.slice(3, 5), 16)}, ${parseInt(
                      matchText.slice(5, 7),
                      16
                  )})`;
        /* eslint-disable indent */
    } else if (matchText.startsWith("rgb")) {
        color = matchText.replace(/rgba?\(/, "rgb(").replace(/,\s*\d+\.?\d*\)/, ")");
    } else if (matchText.startsWith("hsl")) {
        const hslToRgb = (h: number, s: number, l: number) => {
            s /= 100;
            l /= 100;
            const c = (1 - Math.abs(2 * l - 1)) * s;
            const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
            const m = l - c / 2;
            let r = 0,
                g = 0,
                b = 0;

            if (h >= 0 && h < 60) [r, g, b] = [c, x, 0];
            else if (h >= 60 && h < 120) [r, g, b] = [x, c, 0];
            else if (h >= 120 && h < 180) [r, g, b] = [0, c, x];
            else if (h >= 180 && h < 240) [r, g, b] = [0, x, c];
            else if (h >= 240 && h < 300) [r, g, b] = [x, 0, c];
            else if (h >= 300 && h < 360) [r, g, b] = [c, 0, x];

            r = Math.round((r + m) * 255);
            g = Math.round((g + m) * 255);
            b = Math.round((b + m) * 255);
            return `rgb(${r}, ${g}, ${b})`;
        };

        const hslMatch = matchText.match(/hsla?\((\d+),\s*(\d+)%?,\s*(\d+)%?(?:,\s*\d+\.?\d*\))?\)/);
        if (hslMatch) {
            const [, h, s, l] = hslMatch.map(Number);
            color = hslToRgb(h, s, l);
        }
    } else {
        const dummy = document.createElement("div");
        dummy.style.color = matchText.replace(/(?:\s+|-)/g, "");
        document.body.appendChild(dummy);
        color = window.getComputedStyle(dummy).color;
        document.body.removeChild(dummy);
    }

    // @ts-ignore
    return color;
}

async function processNode(node: Node) {
    return new Promise((resolve) => {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.nodeValue?.trim() || "";
            let modified = false;
            const fragment = document.createDocumentFragment();

            let remainingText = text;

            for (const [, regex] of Object.entries(colorPatterns) as [string, RegExp][]) {
                let match;

                while ((match = regex.exec(remainingText)) !== null) {
                    const matchText = match[0];
                    const beforeMatch = remainingText.slice(0, match.index);
                    const afterMatch = remainingText.slice(match.index + matchText.length);

                    if (beforeMatch) {
                        fragment.appendChild(document.createTextNode(beforeMatch));
                    }

                    const wrapper = document.createElement("mark");
                    const bgColor = parseColor(matchText.trim());
                    const isNamedColor = colorPatterns.namedColors.test(matchText);

                    wrapper.style.background = bgColor;
                    wrapper.style.color = isDarkColor(bgColor) ? "#fff" : "#000";
                    wrapper.style.borderRadius = "3px";
                    wrapper.textContent = matchText;

                    const formats = isNamedColor ? ["rgb", "hex", "hsl", "named"] : ["rgb", "hex", "hsl"];
                    const originalFormat = isNamedColor
                        ? "named"
                        : matchText.startsWith("#")
                          ? "hex"
                          : matchText.startsWith("rgb")
                            ? "rgb"
                            : "hsl";
                    const originalIndex = formats.indexOf(originalFormat);

                    wrapper.dataset.color = bgColor;
                    wrapper.dataset.formatIndex = originalIndex.toString();
                    wrapper.dataset.formats = JSON.stringify(formats);

                    if (isNamedColor) {
                        wrapper.dataset.originalName = matchText.toLowerCase();
                    }

                    wrapper.addEventListener("click", (event) => {
                        if (!event.ctrlKey && !event.metaKey) {
                            event.preventDefault();
                        }

                        const formats = JSON.parse(wrapper.dataset.formats as string);
                        const currentFormatIndex = parseInt(wrapper.dataset.formatIndex as string, 10);
                        const originalNamedColor = wrapper.dataset.originalName || undefined;

                        const { color: nextColor } = cycleColorFormat(
                            wrapper.dataset.color as string,
                            formats[currentFormatIndex],
                            originalNamedColor
                        ) as { color: string };

                        wrapper.dataset.color = nextColor.replace(/(?:\s+|-)/, "");
                        wrapper.dataset.formatIndex = ((currentFormatIndex + 1) % formats.length).toString();
                        wrapper.textContent = nextColor;
                        wrapper.style.background = nextColor;
                        wrapper.style.color = isDarkColor(nextColor.replace(/(?:\s+|-)/, "")) ? "#fff" : "#000";
                    });

                    fragment.appendChild(wrapper);

                    remainingText = afterMatch;
                    modified = true;
                }
            }

            if (remainingText) {
                fragment.appendChild(document.createTextNode(remainingText));
            }

            if (modified && node.parentNode) {
                node.parentNode.replaceChild(fragment, node);
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const excludedTags = ["SCRIPT", "STYLE", "NOSCRIPT", "SVG"];
            if (!excludedTags.includes((node as HTMLElement).tagName)) {
                for (const childNode of Array.from(node.childNodes)) {
                    processNode(childNode);
                }
            }
        }

        resolve(undefined);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    processNode(document.body).catch(console.error);
});
