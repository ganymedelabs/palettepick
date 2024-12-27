chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "startColorPicker") {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id as number, { action: "pickColor" });
        });
    } else if (message.action === "saveColor") {
        chrome.storage.local.get("colors", (data) => {
            const colors = data.colors || [];
            colors.push(message.color);
            chrome.storage.local.set({ colors });
        });
    }
});
