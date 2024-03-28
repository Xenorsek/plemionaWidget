let targetTime = '12:00:00'; // Domyślny czas, powinien być nadpisany przez ustawienia z popup
let enabled = false; // Domyślnie wyłączony
console.log("Widget is enabled")

chrome.storage.sync.get(['enabled', 'targetTime'], (data) => {
    if (data.enabled !== undefined) {
      enabled = data.enabled;
    }
    if (data.targetTime) {
      targetTime = data.targetTime;
    }
  });

// Nasłuchuj na zmiany ustawień z popup
chrome.storage.onChanged.addListener(function(changes, namespace) {
    console.log("Settings changed")
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if (key === 'targetTime') {
      targetTime = newValue;
    } else if (key === 'enabled') {
      enabled = newValue;
      if(newValue == true){
        console.log("Clicker is activated!")
      }
      else{
        console.log("Clicker is Deactivated!")
      }
    }
  }
});


function getCzasTrwania() {
    const trs = document.querySelectorAll('tr');
    let czasTrwania = '';

    trs.forEach(tr => {
        if (tr.innerText.includes('Trwanie:')) {
            czasTrwania = tr.children[1].innerText; // Zakładamy, że drugie dziecko <td> zawiera czas trwania
        }
    });

    return czasTrwania;
}

function calculateDocelowaGodzina(czasTrwania) {
    const [godziny, minuty, sekundy] = czasTrwania.split(':').map(Number);
    const teraz = new Date();
    const durationInMs = ((godziny * 60 + minuty) * 60 + sekundy) * 1000;

    const docelowaGodzina = new Date(teraz.getTime() + durationInMs);
    return docelowaGodzina;
}

// Funkcja do obliczenia i porównania czasu przybycia
function checkTimeAndTriggerAction() {
    // Znajdź element z czasem trwania (załóżmy, że jest to pierwszy znaleziony pasujący element)
    const durationElement = getCzasTrwania();
    if (durationElement) {
        const docelowaGodzina = calculateDocelowaGodzina(durationElement);
        if (docelowaGodzina) {
        // Sprawdź, czy obliczony czas przybycia zgadza się z czasem docelowym
        const targetTimeParts = targetTime.split(':').map(part => parseInt(part, 10));
        const targetDateTime = new Date(docelowaGodzina.getTime()); // Skopiowanie daty
        targetDateTime.setHours(targetTimeParts[0], targetTimeParts[1], targetTimeParts[2], 0);
            if (docelowaGodzina >= targetDateTime) {
                const button = document.querySelector('#troop_confirm_submit'); // Zmień na właściwy selektor
                if (button) {
                console.log("Attack!!11")
                button.click();
                }
        }
        }
    }
  }
  
  // Regularne sprawdzanie, czy nadszedł czas na akcję
  setInterval(() => {
    if (enabled) {
        console.log("checking...")
        checkTimeAndTriggerAction();
    }

  }, 300); // Sprawdzaj co sekundę
  

  
    if (window.location.href.indexOf("screen=main") > -1) {
        console.log("widget in main is active")
            // Definiuję surowce, które chcę sprawdzać
            const resources = ['wood', 'stone', 'iron'];
            const availableResources = {};
            resources.forEach((resource => {
                availableResources[resource] = (parseInt(document.getElementById(resource).textContent, 10))
            }));

            resources.forEach(resource => {
              // Znajdź wszystkie elementy z klasą `cost_[resource].warn`
              const costElements = document.querySelectorAll(`.cost_${resource}.warn`);
          
              // Dla każdego z tych elementów
              costElements.forEach(element => {
                // Pobierz wartość kosztu surowca z atrybutu data-cost
                const cost = parseInt(element.getAttribute('data-cost'), 10);
          
                // Pobierz aktualną ilość dostępnego surowca
                const available = availableResources[resource];
          
                // Oblicz różnicę
                const difference = cost - available;
          
                // Tworzenie tooltipa
                if (difference > 0) {
                  const tooltip = document.createElement('div');
                  tooltip.style.display = 'none';
                  tooltip.style.position = 'absolute';
                  tooltip.style.border = '1px solid #333';
                  tooltip.style.background = '#fff';
                  tooltip.style.padding = '5px';
                  tooltip.textContent = `Brakuje: ${difference}`;
          
                  // Umieszczanie tooltipa w DOM
                  document.body.appendChild(tooltip);
          
                  // Pokaż tooltip przy hoverze
                  element.addEventListener('mouseenter', function(event) {
                    const offsetAboveCursor = 30;
                    tooltip.style.left = `${event.pageX}px`;
                    tooltip.style.top = `${event.pageY - offsetAboveCursor}px`;
                    tooltip.style.display = 'block';
                });
          
                  // Ukryj tooltip, gdy mysz opuści element
                  element.addEventListener('mouseleave', () => {
                    tooltip.style.display = 'none';
                  });
                }
              });
            }); 
    }
    else{
        
    }
