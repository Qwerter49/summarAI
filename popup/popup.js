document.addEventListener("DOMContentLoaded", () => {
    setButtonsVisibility(true);
    handleModelSelectorPopulation();
    document.getElementById("highlightBtn").addEventListener("click", handleHighlightClick);
    document.getElementById("regenerate-btn").addEventListener("click", handleRegenerateClick);
    document.getElementById("copy-btn").addEventListener("click", handleCopyClick);
    document.getElementById("copy-btn").addEventListener("click", handleCopyClick);
    document.getElementById("advancedSettingsBtn").addEventListener("click", handleAdvancedSettingsClick);
    document.getElementById("modelSelector").style.display = "none";
    document.getElementById("modelSelectorLabel").style.display = "none";


  });

const removeHTMLTags = (text) => {
    const div = document.createElement("div");
    div.innerHTML = text;
    return div.textContent || div.innerText || "";
  };
  
  const handleHighlightClick = async () => {
    const loadingSpinner = document.getElementById("loadingSpinner");
    const summaryResult = document.getElementById("summaryResult");
  
    const [tab] = await new Promise((resolve) =>
      chrome.tabs.query({ active: true, currentWindow: true }, resolve)
    );
    const highlightedText = await sendMessage(tab.id, { action: "getHighlightedText" });
  
    if (highlightedText) {
      const apiKey = await getApiKey();
      const cleanedText = removeHTMLTags(highlightedText);
      const selectedModel = document.getElementById("modelSelector").value;
      const summaryLength = document.getElementById("summaryLength").value;
  
      summaryResult.innerText = "";
      loadingSpinner.style.display = "flex";
      toggleActionsVisibility();
      const summarizeBtn = document.getElementById("highlightBtn");
      summarizeBtn.style.display = "none";
      const summary = await summarize(cleanedText, apiKey, selectedModel, summaryLength);
      loadingSpinner.style.display = "none";
      toggleActionsVisibility();
      summaryResult.innerText = `Summary: ${summary}`;
      setButtonsVisibility(false,true);
    } else {
      alert("No text selected!");
    }
  };
  
  const handleRegenerateClick = async () => {
    const [tab] = await new Promise((resolve) =>
      chrome.tabs.query({ active: true, currentWindow: true }, resolve)
    );
    const highlightedText = await sendMessage(tab.id, { action: "getHighlightedText" });
  
    if (highlightedText) {
      summarizeAndDisplay(highlightedText);
    } else {
      alert("No text to regenerate summary!");
    }
  };

const handleModelSelectorPopulation = async () => {
    try {
      const apiKey = await getApiKey();
      const models = await getAvailableModels(apiKey);
      const modelSelector = document.getElementById("modelSelector");
  
      models.forEach((model) => {
        const option = document.createElement("option");
        option.value = model;
        option.innerText = model;
        modelSelector.appendChild(option);
        modelSelector.value = "text-davinci-003";
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCopyClick = () => {
    const summaryResult = document.getElementById("summaryResult");
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = summaryResult.innerText;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand("copy");
    document.body.removeChild(tempTextArea);
    alert("Summary copied to clipboard.");
  };

  const sendMessage = (tabId, message) => new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });

  const summarizeAndDisplay = async (text) => {
    try {
      const apiKey = await getApiKey();
      const cleanedText = removeHTMLTags(text);
      const selectedModel = document.getElementById("modelSelector").value;
      const summaryLength = document.getElementById("summaryLength").value;
  
      // Show the spinner and hide the actions container
      summaryResult.innerText = "";
      loadingSpinner.style.display = "flex";
      toggleActionsVisibility(false);
  
      const summary = await summarize(cleanedText, apiKey, selectedModel, summaryLength);
  
      // Hide the spinner and display the summary, then show the actions container
      loadingSpinner.style.display = "none";
      summaryResult.innerText = `Summary: ${summary}`;
      toggleActionsVisibility(true);
    } catch (error) {
      // Hide the spinner if an error occurs and show the actions container
      loadingSpinner.style.display = "none";
      toggleActionsVisibility(true);
      console.error("Error:", error);
    }
  };
  

const summarize = async (text, apiKey, engine = "davinci", summaryLength) => {
    let prompt;
    if (summaryLength === "one") {
      prompt = `Please provide a single, concise sentence that summarizes the following text: ${text}`;
    } else if (summaryLength === "two-four") {
      prompt = `Please summarize the following text in 2-4 short, concise sentences: ${text}`;
    } else if (summaryLength === "bulleted") {
      prompt = `Please provide a clear summary of the following text in the form of bullet points: ${text}`;
    }


    const response = await fetch(`https://api.openai.com/v1/engines/${engine}/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: 200,
        n: 1,
        stop: null,
        temperature: 0.3,
      }),
    });
  console.log(summaryLength)
    const data = await response.json();
    return data.choices[0].text.trim();
  };

  const getApiKey = async () => {
    return new Promise((resolve) => {
      chrome.storage.local.get("apiKey", (result) => {
        console.log("API Key:", result.apiKey);
        resolve(result.apiKey);
      });
    });
  };

  const getAvailableModels = async (apiKey) => {
    const response = await fetch("https://api.openai.com/v1/engines", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
    });
  
    const data = await response.json();
    return data.data.map((engine) => engine.id);
  };
  
  const setButtonsVisibility = (summarizeVisible, actionsVisible) => {
    const regenerateBtn = document.getElementById("regenerate-btn");
    const copyBtn = document.getElementById("copy-btn");
    const summarizeBtn = document.getElementById("highlightBtn");
  
    if (summarizeVisible) {
      summarizeBtn.style.display = "flex";
    } else {
      summarizeBtn.style.display = "none";
    }
  
    if (actionsVisible && summaryResult.textContent.trim() !== "") {
      regenerateBtn.style.display = "inline";
      copyBtn.style.display = "inline";
    } else {
      regenerateBtn.style.display = "none";
      copyBtn.style.display = "none";
    }
  };
  

  const toggleActionsVisibility = () => {
    const actionsContainer = document.getElementById("actions-container");
    const loadingSpinner = document.getElementById("loadingSpinner");
  
    if (loadingSpinner.style.display === "flex") {
      actionsContainer.style.display = "none";
    } else {
      actionsContainer.style.display = "flex";
    }
  };

  const handleAdvancedSettingsClick = (event) => {
    event.preventDefault();
    const modelSelector = document.getElementById("modelSelector");
    if (modelSelector.style.display === "none") {
      modelSelector.style.display = "flex";
      modelSelectorLabel.style.display = "flex";

    } else {
      modelSelector.style.display = "none";
      modelSelectorLabel.style.display = "none";
    }
  };
