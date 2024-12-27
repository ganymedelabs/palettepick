import { convertToHEX, convertToHSL, generatePalettes, isDarkColor } from "./utils";

document.getElementById("pick-color")?.addEventListener("click", async () => {
    chrome.runtime.sendMessage({ action: "startColorPicker" });
    window.close();
});

chrome.storage.local.get("colors", (data) => {
    const colors: string[] = data.colors || [];
    const colorList = document.getElementById("color-list") as HTMLUListElement;

    colors.reverse();

    colors.forEach((color) => {
        const listItem = document.createElement("li");

        listItem.innerHTML = `
        <!--html-->
        <div class="rgb">${color}</div>
        <div class="hex">${convertToHEX(color)}</div>
        <div class="hsl">${convertToHSL(color)}</div>
        <!--!html-->
        `;

        listItem.style.color = isDarkColor(color) ? "#fff" : "#000";
        listItem.style.background = color;
        listItem.className = "color-entry";

        listItem.addEventListener("click", () => {
            const palettes = generatePalettes(color);
            showPalettePage(palettes);
        });

        colorList.appendChild(listItem);

        if (Array.from(colorList.children).length > 10) {
            colorList.lastChild?.remove();
        }
    });
});

function showPalettePage(palettes: string[][]) {
    const mainPage = document.querySelector(".options-container") as HTMLElement;
    const colorList = document.getElementById("color-list");
    if (mainPage) mainPage.style.display = "none";
    if (colorList) colorList.style.display = "none";

    const paletteContainer = document.createElement("div");
    paletteContainer.className = "palette-page";

    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.className = "close-button";
    closeButton.addEventListener("click", () => {
        paletteContainer.remove();
        if (mainPage) mainPage.style.display = "block";
        if (colorList) colorList.style.display = "block";
    });

    paletteContainer.appendChild(closeButton);

    palettes.forEach((palette) => {
        const paletteDiv = document.createElement("div");
        paletteDiv.className = "palette";

        palette.forEach((color) => {
            const colorDiv = document.createElement("div");
            colorDiv.style.background = color;
            colorDiv.textContent = color;
            paletteDiv.appendChild(colorDiv);
        });

        paletteContainer.appendChild(paletteDiv);
    });

    document.body.appendChild(paletteContainer);
}
