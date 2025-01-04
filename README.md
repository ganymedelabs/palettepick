# PalettePick Chrome Extension

![Code size](https://custom-icon-badges.demolab.com/github/languages/code-size/ganemedelabs/palettepick?logo=file-code&logoColor=white)
![Webpack](https://custom-icon-badges.demolab.com/badge/Built%20with-Webpack-8DD6F9.svg?logo=webpack&logoColor=white)
![JavaScript](https://custom-icon-badges.demolab.com/badge/JavaScript-Vanilla-F7DF1E.svg?logo=javascript&logoColor=white)
![License](https://custom-icon-badges.demolab.com/github/license/ganemedelabs/palettepick?logo=law)

PalettePick is a Chrome extension that enhances your browsing experience by detecting and highlighting color strings directly on web pages. Whether it's CSS color names, hex codes, RGB, RGBA, HSL, or HSLA, the extension highlights these colors with their actual hues.  

You can also interact with these highlighted colors to transform them into different formats. Additionally, the extension includes a built-in color picker that allows you to select and save colors from any webpage and even generates palettes based on your selected colors.  

## 📋 Table of Contents

- [Features](#-features)
- [Upcoming Support](#-upcoming-support)
- [Installation](#-installation)
- [License](#-license)
- [Contact](#-contact)
- [Credits](#-credits)

## ✨ Features

- **Dynamic Color Highlighting**: Detects and highlights color strings on webpages, including:  
  - CSS color names (e.g., "red", "blue")  
  - Hexadecimal codes (e.g., "#FF5733")  
  - RGB and RGBA (e.g., "rgb(255, 87, 51)", "rgba(255, 87, 51, 0.5)")  
  - HSL and HSLA (e.g., "hsl(10, 100%, 60%)", "hsla(10, 100%, 60%, 0.5)")  

- **Interactive Color Conversion**: Clicking on a highlighted color string cycles it through different formats:  
  1. CSS Color Name  
  2. RGB  
  3. Hexadecimal  
  4. HSL  
  5. Back to the original format  

- **Built-in Color Picker**:  
  - Pick colors directly from any webpage.  
  - Save selected colors to the extension popup.  

- **Palette Generation**:  
  - Generate color palettes based on saved colors.  
  - Click on saved colors to view harmonious palettes.  

## 📅 Upcoming Support  

PalettePick will soon support additional **CSS color models**, including:  

-   [ ] **HWB (Hue, Whiteness, Blackness)**:  
  - `hwb(12 50% 0%)`  
  - `hwb(194 0% 0% / 0.5)`  

-   [ ] **LAB (Lightness, A-axis, B-axis)**:  
  - `lab(50% 40 59.5)`  
  - `lab(50% 40 59.5 / 0.5)`  

-   [ ] **LCH (Lightness, Chroma, Hue)**:  
  - `lch(52.2% 72.2 50)`  
  - `lch(52.2% 72.2 50 / 0.5)`  

-   [ ] **Oklab (Lightness, A-axis, B-axis)**:  
  - `oklab(59% 0.1 0.1)`  
  - `oklab(59% 0.1 0.1 / 0.5)`  

-   [ ] **Oklch (Lightness, Chroma, Hue)**:  
  - `oklch(60% 0.15 50)`  
  - `oklch(60% 0.15 50 / 0.5)`  

-   [ ] **Relative CSS Colors**:  
  - `hsl(from red 240deg s l)`  
  - `hwb(from green h w b / 0.5)`  
  - `lch(from blue calc(l + 20) c h)`  

## 🔧 Installation

1. Clone the repository or download the zip file:  
   ```bash
   git clone https://github.com/ganemedelabs/palettepick.git
   ```
2. Navigate to the project directory and build the project by running:  
   ```bash
   npm run build
   ```
3. Open Chrome and go to `chrome://extensions/`.  
4. Enable **Developer Mode** using the toggle in the top-right corner.  
5. Click **Load Unpacked** and select the `dist` folder.  
6. PalettePick is now ready to use!  

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 📧 Contact

For inquiries or more information, you can reach out to us at [ganemedelabs@gmail.com](mailto:ganemedelabs@gmail.com).

## 🙏 Credits

Icons used in this extension is by [Freepik](https://www.flaticon.com/) on Flaticon.