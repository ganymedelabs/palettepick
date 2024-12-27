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

function showPalettePage(palettes: Record<string, string[][]>) {
    console.log(palettes);
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

        Object.keys(palettes).forEach((key) => {
            const targetSection = palettesPage.querySelector(`#${key}`) as HTMLElement;
            const paletteArray = palettes[key];

            if (!targetSection) return;

            const palettesContainer = targetSection.querySelector(".palettes-container") as HTMLElement;

            if (palettesContainer) {
                while (palettesContainer.firstChild) {
                    palettesContainer.removeChild(palettesContainer.firstChild);
                }

                paletteArray.forEach((palette) => {
                    const paletteDiv = document.createElement("div");
                    paletteDiv.className = "palette";

                    palette.forEach((color) => {
                        const colorDiv = document.createElement("div");
                        colorDiv.className = "color";
                        colorDiv.style.background = color;
                        colorDiv.textContent = convertToHEX(color);
                        paletteDiv.appendChild(colorDiv);
                    });

                    palettesContainer.appendChild(paletteDiv);
                });
            }
        });
    }
}
