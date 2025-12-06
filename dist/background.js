chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "summarize-text",
    title: "Summarize",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "summarize-text") {
    chrome.storage.local.set({ selectedText: info.selectionText }, () => {});
    chrome.action.openPopup();
  }
});
