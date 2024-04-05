document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM")
    let toggleButton = document.getElementById('toggleEnabled');
    let saveButton = document.getElementById('save');
    let timeInput = document.getElementById('time');
    let gmtInput = document.getElementById('plemionaGmt');
    let testButton = document.getElementById('test');

  // Pobranie aktualnych ustawień i ich ustawienie w interfejsie użytkownika
  chrome.storage.sync.get(['enabled', 'targetTime', 'gmt'], (data) => {
      updateToggleButton(data.enabled);

      if (data.targetTime) { // Sprawdzenie czy wartość istnieje
          timeInput.value = data.targetTime;
      }
      if(data.gmt){
        gmtInput.value = data.gmt;
      }
  });

  toggleButton.addEventListener('click', () => {
      // Przełączenie wartości enabled i aktualizacja tekstu przycisku
      chrome.storage.sync.get(['enabled'], (data) => {
          const newEnabledValue = !data.enabled;
          chrome.storage.sync.set({enabled: newEnabledValue}, () => {
              updateToggleButton(newEnabledValue);
          });
      });
  });

  saveButton.addEventListener('click', () => {
      // Zapisywanie ustawień po kliknięciu przycisku "Zapisz"
      chrome.storage.sync.get(['enabled'], (data) => {
          chrome.storage.sync.set({
              targetTime: timeInput.value,
              enabled: data.enabled, // Zachowujemy wartość enabled
              gmt: gmtInput.value
          }, () => {
              console.log('Settings saved');
          });
      });
  });

  testButton.addEventListener('click', () => {
    console.log("klikniety")
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "test"});
    });
});
});


function updateToggleButton(enabled) {
  const toggleButton = document.getElementById('toggleEnabled');
  toggleButton.textContent = enabled ? 'Dezaktywuj' : 'Aktywuj';
}
