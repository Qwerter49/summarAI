document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("saveApiKey").addEventListener("click", () => {
      const apiKey = document.getElementById("apiKey").value;
      chrome.storage.local.set({ apiKey }, () => {
        alert("API Key saved.");
        window.close(); // Close the current tab
      });
    });
  });
  