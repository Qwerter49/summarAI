chrome.runtime.onInstalled.addListener(async () => {
    const apiKey = await new Promise((resolve) => {
      chrome.storage.local.get("apiKey", (result) => {
        resolve(result.apiKey);
      });
    });
  
    if (!apiKey) {
      chrome.tabs.create({ url: "options/options.html" });
    }
  });

  