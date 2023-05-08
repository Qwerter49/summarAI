chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getHighlightedText") {
      const selection = window.getSelection();
      sendResponse(selection.toString());
    }
  });