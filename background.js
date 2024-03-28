chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ enabled: false, targetTime: '12:00:00' }); // Uwzględniamy sekundy
});

console.log("initialize")
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log("something!")
  // Sprawdzamy, czy status to 'complete' i czy URL zakładki istnieje oraz zawiera 'plemiona.pl'
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('plemiona.pl')) {
    chrome.storage.sync.get(['enabled', 'targetTime'], function(data) {
      if (data.enabled) {
        console.log("something!!")
        chrome.scripting.executeScript({
          target: { tabId: tabId },
          function: checkTimeAndClickButton,
          args: [data.targetTime]
        });
      }
    });
  }
});

function checkTimeAndClickButton(targetTime) {
  console.log("Initialize method")
  const timeField = document.querySelector('.relative_time'); // Używamy klasy jako selektora
  if (timeField) {
    console.log("check time")
    // Zakładamy, że format daty to "dzisiaj o HH:MM:SS"
    const currentTime = timeField.textContent.split('o ')[1]; // Pobieramy tylko część z godziną
    if (currentTime) {
      const [currentHours, currentMinutes, currentSeconds] = currentTime.split(':').map(Number);
      const [targetHours, targetMinutes, targetSeconds] = targetTime.split(':').map(Number);

      if (targetHours === currentHours && targetMinutes === currentMinutes && targetSeconds === currentSeconds) {
        const button = document.querySelector('#troop_confirm_submit'); // Zmień 'buttonSelector' na właściwy selektor przycisku
        if (button) {
          button.click();
        }
      }
    }
  }
}
