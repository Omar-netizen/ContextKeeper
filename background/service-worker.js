// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('ContextKeeper installed');
});

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SNIPPET_SAVED') {
    // You can add additional logic here if needed
    console.log('Snippet saved notification received');
  }
});