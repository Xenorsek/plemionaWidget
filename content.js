let targetTime = '12:00:00'; // Domyślny czas, powinien być nadpisany przez ustawienia z popup
let enabled = false; // Domyślnie wyłączony
let gmt = checkGmt();
let plemionaGmt = 2;

console.log("Widget is enabled")

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      if (request.action == "test") {
          testAttack(); // Wywołaj swoją metodę
      }
  }
);

chrome.storage.sync.get(['enabled', 'targetTime'], (data) => {
    if (data.enabled !== undefined) {
      enabled = data.enabled;
    }
    if (data.targetTime) {
      targetTime = data.targetTime;
    }
    if(data.gmt){
      plemionaGmt = data.gmt;
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

Date.prototype.addHours = function(h){
  this.setHours(this.getHours()+h);
  return this;
}

function calculateDocelowaGodzina(czasTrwania) {
    const [godziny, minuty, sekundy] = czasTrwania.split(':').map(Number);
    const teraz = new Date();
    if(gmt !== plemionaGmt){
      teraz.addHours(gmt - plemionaGmt);
    }
    
    const durationInMs = ((godziny * 60 + minuty) * 60 + sekundy) * 1000;

    const docelowaGodzina = new Date(teraz.getTime() + durationInMs);
    return docelowaGodzina;
}

function checkGmt(){
  const now = new Date();
  const timezoneOffsetInMinutes = now.getTimezoneOffset();
  const timezoneOffsetInHours = timezoneOffsetInMinutes / 60;
  const gmtOffset = `${timezoneOffsetInHours > 0 ? '-' : '+'}${Math.abs(timezoneOffsetInHours)}`;
  return gmtOffset;
}

function checkTimeAndTriggerActionDiffrentCalculations(){
  const durationElement = getCzasTrwania();
  if (durationElement) {
    const docelowaGodzina = calculateDocelowaGodzina(durationElement);
    const targetTimeParts = targetTime.split(':').map(part => parseInt(part, 10));

    let docelowaHours = docelowaGodzina.getHours();
    let docelowaMinutes = docelowaGodzina.getMinutes();
    let docelowaSeconds = docelowaGodzina.getSeconds();
    if(docelowaHours == targetTimeParts[0] && docelowaMinutes == targetTimeParts[1] && docelowaSeconds >= targetTimeParts[2] ){
      const button = document.querySelector('#troop_confirm_submit');
        if (button) {
          console.log("Attack!!!1")
          button.click();
        }
        else{
          console.log("nie moge znaleźć przycisku :(");
        }
    }
  }
  else{
    console.log("czas trwania nie jest widoczny")
  }
}

function testAttack(){
  console.log("rozpoczynam test")
  //TEST Czasu aktywacji z widget popup
  var teraz = new Date();
  if(gmt !== plemionaGmt){
    teraz.addHours(gmt - plemionaGmt);
  }
  console.log(`Godzina w plemionach to: ${teraz} `);

  if(targetTime){
    console.log(`Czas aktywacji zaplanowany na: ${targetTime}`);
  }
  else{
    console.error("Błąd z targetTime (Czas aktywacji)");
  }
  
  if(plemionaGmt){
    console.log(`plemiona w widget GMT ustawione na ${plemionaGmt}`);
  }
    //Test z czytaniem Trwanie: 
  const durationElement = getCzasTrwania();
  if(durationElement){
    console.log("widzę element z Trwanie:");
  }
  else{
    console.error("Nie widzę elementu z trwanie. ")
  }

  //SPRAWDZENIE czy jest widoczny przycisk Wyślij atak
  const button = document.querySelector('#troop_confirm_submit');
  if(button){
    console.log("przycisk button Wyślij atak jest widoczny")
  }
  else{
    console.error("przycisk Wyślij atak nie jest widoczny");
  }

  //Test z przykladowymi danymi
  if(targetTime && durationElement){
    const docelowaGodzina = calculateDocelowaGodzina(durationElement);
    const targetTimeParts = targetTime.split(':').map(part => parseInt(part, 10));
    const targetDateTime = new Date(docelowaGodzina.getTime()); // Skopiowanie daty

    targetDateTime.setHours(targetTimeParts[0], targetTimeParts[1], targetTimeParts[2], 0);
    if(gmt !== plemionaGmt){
      targetDateTime.addHours(gmt - plemionaGmt);
    }
    let docelowaHours = docelowaGodzina.getHours();
    let docelowaMinutes = docelowaGodzina.getMinutes();
    let docelowaSeconds = docelowaGodzina.getSeconds();
    console.log(`Dane: Czas aktywacji: ${targetTimeParts[0]}:${targetTimeParts[1]}:${targetTimeParts[2]}`);
    console.log(`Trwanie:  ${durationElement}`);
    console.log(`Jakby został atak przeprowadzony teraz to:  ${docelowaGodzina}`);
    
    if(docelowaHours == targetTimeParts[0] && docelowaMinutes == targetTimeParts[1] && docelowaSeconds >= targetTimeParts[2] ){
      console.log("Przy tych danych atak zostałby wykonany");
    }
    else{
      console.log("Przy tych danych atak zostałby nie wykonany");
    }
  }
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
                const button = document.querySelector('#troop_confirm_submit'); 
                if (button) {
                console.log("Attack!!!1")
                button.click();
                }
        }
      }
      else{
        console.log("problem z docelowa godzina w kodzie");
      }
    }
    else{
      console.log("nie ma elementu z Trwanie:")
    }
  }
  
  // Regularne sprawdzanie, czy nadszedł czas na akcję
  setInterval(() => {
    if (enabled) {
      if (window.location.href.indexOf("screen=map") > -1){
        console.log("checking...")
        checkTimeAndTriggerActionDiffrentCalculations();
      }
        else{
          console.log("wejdź na mapę i zaplanuj atak");
        }
    }
  }, 300); // Sprawdzaj co sekundę
  

  
if (window.location.href.indexOf("screen=main") > -1) {
  console.log("widget in main is active");
  function updateToolTips() {
      // Usuwamy istniejące tooltipy
      document.querySelectorAll('.custom-tooltip').forEach(tooltip => {
          tooltip.remove();
      });

      const resources = ['wood', 'stone', 'iron'];
      const availableResources = {};
      resources.forEach(resource => {
          availableResources[resource] = parseInt(document.getElementById(resource).textContent, 10);
      });

      resources.forEach(resource => {
          const costElements = document.querySelectorAll(`.cost_${resource}.warn`);
          costElements.forEach(element => {
              const cost = parseInt(element.getAttribute('data-cost'), 10);
              const available = availableResources[resource];
              const difference = cost - available;

              if (difference > 0) {
                  const tooltip = document.createElement('div');
                  tooltip.className = 'custom-tooltip'; // Dodajemy klasę dla łatwego identyfikowania
                  tooltip.style.display = 'none';
                  tooltip.style.position = 'absolute';
                  tooltip.style.border = '1px solid #333';
                  tooltip.style.background = '#fff';
                  tooltip.style.padding = '5px';
                  tooltip.textContent = `Brakuje: ${difference}`;

                  document.body.appendChild(tooltip);

                  element.addEventListener('mouseenter', function(event) {
                      tooltip.style.left = `${event.pageX}px`;
                      tooltip.style.top = `${event.pageY - 30}px`;
                      tooltip.style.display = 'block';
                  });

                  element.addEventListener('mouseleave', () => {
                      tooltip.style.display = 'none';
                  });
              }
          });
      });
  }
  updateToolTips(); // Wywołanie przy pierwszym ładowaniu

  // Dodajemy nasłuchiwacze do przycisków budowy
  document.querySelectorAll('.btn-build').forEach(button => {
      button.addEventListener("click", () => {
        setTimeout(updateToolTips, 500); // Zakładamy, że akcja może zająć trochę czasu, dlatego czekamy 500ms przed odświeżeniem
      });
  });

}