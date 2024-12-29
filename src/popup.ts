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
    const emptyElement = document.getElementById("empty") as HTMLElement;

    if (colors.length === 0) {
        colorList.style.display = "none";
        emptyElement.style.display = "flex";
        return;
    }

    colorList.style.display = "grid";
    emptyElement.style.display = "none";

    colors.reverse();

    colors.forEach((color) => {
        const listEntry = document.createElement("li");

        listEntry.innerHTML = `
            <!--html-->
            <div class="rgb">${color}</div>
            <div class="hex">${convertToHEX(color)}</div>
            <div class="hsl">${convertToHSL(color)}</div>
            <!--!html-->
        `;

        listEntry.style.color = isDarkColor(color) ? "#fff" : "#000";
        listEntry.style.background = color;
        listEntry.classList.add("list-entry");

        listEntry.addEventListener("click", async () => {
            const palettesTitle = document.querySelector("#palettes-page .header .title") as HTMLElement;
            palettesTitle.textContent = color;

            const palettes = await generatePalettes(color);
            const shuffledPalettes = shuffleArray(palettes);
            showPalettePage(shuffledPalettes);
        });

        colorList.appendChild(listEntry);

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

        const palettesList = palettesPage.querySelector("#palettes-list") as HTMLElement;
        const errorElement = document.getElementById("error") as HTMLElement;
        Array.from(palettesList.children).forEach((palettesList) => palettesList.remove());

        if (palettes.length === 0) {
            palettesList.style.display = "none";
            errorElement.style.display = "flex";
            return;
        }

        palettesList.style.display = "grid";
        errorElement.style.display = "none";

        palettes.forEach((palette) => {
            if (palette.length === 0) return;

            const listEntry = document.createElement("li");
            listEntry.classList.add("list-entry");

            palette.forEach((color) => {
                const colorDiv = document.createElement("div");
                colorDiv.className = "color";
                colorDiv.style.color = isDarkColor(color) ? "#fff" : "#000";
                colorDiv.style.background = color;
                colorDiv.textContent = convertToHEX(color);
                listEntry.appendChild(colorDiv);
            });

            palettesList.appendChild(listEntry);
        });
    }
}
