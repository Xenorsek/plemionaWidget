document.addEventListener('DOMContentLoaded', function() {
  let toggleButton = document.getElementById('toggleEnabled');
  let saveButton = document.getElementById('save');
  let timeInput = document.getElementById('time');

  // Pobranie aktualnych ustawień i ich ustawienie w interfejsie użytkownika
  chrome.storage.sync.get(['enabled', 'targetTime'], (data) => {
      updateToggleButton(data.enabled);

      if (data.targetTime) { // Sprawdzenie czy wartość istnieje
          timeInput.value = data.targetTime;
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
              enabled: data.enabled // Zachowujemy wartość enabled
          }, () => {
              console.log('Settings saved');
          });
      });
  });
});

function updateToggleButton(enabled) {
  const toggleButton = document.getElementById('toggleEnabled');
  toggleButton.textContent = enabled ? 'Dezaktywuj' : 'Aktywuj';
}
