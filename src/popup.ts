import { convertToHEX, convertToHSL, generatePalettes, isDarkColor } from "./utils";

document.getElementById("pick-color")?.addEventListener("click", async () => {
    chrome.runtime.sendMessage({ action: "startColorPicker" });
    window.close();
});

chrome.storage.local.get("colors", (data) => {
    const shuffleArray = <T>(array: T[]): T[] => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

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
            const shuffledPalettes = shuffleArray(palettes);
            showPalettePage(shuffledPalettes);
        });

        colorList.appendChild(listItem);

        if (Array.from(colorList.children).length > 10) {
            colorList.lastChild?.remove();
        }
    });
});

function showPalettePage(palettes: string[][]) {
    const mainPage = document.getElementById("main-page") as HTMLElement;
    const palettesPage = document.getElementById("palettes-page") as HTMLElement;

    if (mainPage) mainPage.style.display = "none";

    if (palettesPage) {
        const closeButton = palettesPage.querySelector(".close-button") as HTMLButtonElement;
        palettesPage.style.display = "block";

        closeButton.addEventListener("click", () => {
            palettesPage.style.display = "none";
            if (mainPage) mainPage.style.display = "block";
        });

        const palettesContainer = palettesPage.querySelector(".palettes-container") as HTMLElement;
        Array.from(palettesContainer.children).forEach((paletteDiv) => paletteDiv.remove());

        if (palettes.length === 0) {
            const p = document.createElement("p");
            p.textContent = "Cannot generate palettes for this color.";
            palettesContainer.appendChild(p);
            return;
        }

        palettes.forEach((palette) => {
            if (palette.length === 0) return;

            const paletteDiv = document.createElement("div");
            paletteDiv.className = "palette";

            palette.forEach((color) => {
                const colorDiv = document.createElement("div");
                colorDiv.className = "color";
                colorDiv.style.color = isDarkColor(color) ? "#fff" : "#000";
                colorDiv.style.background = color;
                colorDiv.textContent = convertToHEX(color);
                paletteDiv.appendChild(colorDiv);
            });

            palettesContainer.appendChild(paletteDiv);
        });
    }
}
