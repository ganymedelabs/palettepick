import { colorPatterns } from "./common";
import { cycleColorFormat, convertToRGB, isDarkColor } from "./utils";
import html2canvas from "html2canvas";

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
                    const bgColor = convertToRGB(matchText.trim().replace(/(?:\s+|-)/g, ""));
                    const isNamedColor = colorPatterns.namedColors.test(matchText);

                    wrapper.style.background = bgColor;
                    wrapper.style.color = isDarkColor(bgColor) ? "#fff" : "#000";
                    wrapper.style.borderRadius = "3px";
                    wrapper.textContent = matchText;

                    const formats = isNamedColor ? ["rgb", "hex", "hsl", "named"] : ["rgb", "hex", "hsl"];
                    /* eslint-disable indent */
                    const originalFormat = isNamedColor
                        ? "named"
                        : matchText.startsWith("#")
                          ? "hex"
                          : matchText.startsWith("rgb")
                            ? "rgb"
                            : "hsl";
                    /* eslint-enable indent */
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

                        wrapper.dataset.color = nextColor.replace(/(?:\s+|-)/g, "");
                        wrapper.dataset.formatIndex = ((currentFormatIndex + 1) % formats.length).toString();
                        wrapper.textContent = nextColor;
                        wrapper.style.background = nextColor;
                        wrapper.style.color = isDarkColor(nextColor.replace(/(?:\s+|-)/g, "")) ? "#fff" : "#000";
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

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "pickColor") {
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.cursor = "crosshair";
        overlay.style.zIndex = "10000";
        overlay.style.background = "rgba(0, 0, 0, 0.1)";
        document.body.appendChild(overlay);

        const handleClick = async (event: MouseEvent) => {
            try {
                const x = event.clientX + window.scrollX;
                const y = event.clientY + window.scrollY;

                overlay.style.display = "none";

                const scale = window.devicePixelRatio || 1;

                const canvas = await html2canvas(document.body, {
                    backgroundColor: null,
                    useCORS: true,
                    scale: scale,
                });

                const context = canvas.getContext("2d");
                if (!context) throw new Error("Canvas context is null");

                const pixel = context.getImageData(x * scale, y * scale, 1, 1).data;

                const color = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
                chrome.runtime.sendMessage({ action: "saveColor", color });

                console.log(`Picked color: ${color}`);
            } catch (error) {
                console.error("Error picking color:", error);
            } finally {
                document.body.removeChild(overlay);
                document.removeEventListener("click", handleClick);
            }
        };

        overlay.addEventListener("click", (event: MouseEvent) => {
            event.stopPropagation();
            handleClick(event);
        });
    }
});
