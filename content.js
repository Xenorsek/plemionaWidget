let targetTime = '12:00:00'; // Domyślny czas, powinien być nadpisany przez ustawienia z popup
let enabled = false; // Domyślnie wyłączony
let localGmt = checkGmt();
let plemionaGmt = 2;

console.log("Widget is enabled")

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
      if (request.action == "test") {
          testAttack(); // Wywołaj swoją metodę
      }
  }
);

chrome.storage.sync.get(['enabled', 'targetTime', 'gmt'], (data) => {
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
    } else if(key === 'gmt'){
      plemionaGmt = newValue;
    }
     else if (key === 'enabled') {
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
    if(localGmt !== plemionaGmt){
      teraz.addHours(localGmt - plemionaGmt);
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

function checkForBuildIn(plannerTime){
  const durationElement = getCzasTrwania();
  if (durationElement) {
    const docelowaGodzina = calculateDocelowaGodzina(durationElement);
    const targetTimeParts = plannerTime.split(':').map(part => parseInt(part, 10));

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
  if(localGmt !== plemionaGmt){
    teraz.addHours(localGmt - plemionaGmt);
  }
  console.log(`Godzina w plemionach to: ${teraz} `);

  if(targetTime){
    console.log(`Czas aktywacji zaplanowany na: ${targetTime}`);
  }
  else{
    console.error("Błąd z targetTime (Czas aktywacji)");
  }
  
  if(plemionaGmt){
    console.log(`GMT w popup to ${plemionaGmt}`);
  }

  if(localGmt){
    console.log(`twój gmt to ${localGmt}`);
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
    if(localGmt !== plemionaGmt){
      targetDateTime.addHours(plemionaGmt - localGmt);
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
  

// rynek -- przycisk załącz wszystkie zasoby
if (window.location.href.indexOf("screen=market&mode=send") > -1){
  console.log("widget in market is active");
  let resourcesTable = null;
  var thElements = document.querySelectorAll('th');
  var targetTh = Array.from(thElements).find(th => th.textContent.trim() === "Surowce");

  if (targetTh) {
    var parentTd = targetTh.parentElement;
    while (parentTd && parentTd.tagName !== 'TD') {
        parentTd = parentTd.parentElement;
    }

    if (parentTd && parentTd.getAttribute('valign') === "top") {
        // Znaleziono odpowiedni element <td valign="top">
        resourcesTable = parentTd;
    }
  }

  var insertWoodButton = resourcesTable.querySelector('a.insert[data-res="wood"]');
  var insertStoneButton = resourcesTable.querySelector('a.insert[data-res="stone"]');
  var insertIronButton = resourcesTable.querySelector('a.insert[data-res="iron"]');

  var triggerAllResourcesButton = document.createElement('button');
  triggerAllResourcesButton.id = 'triggerAllResources';
  triggerAllResourcesButton.textContent = 'Wciśnij wszystkie zasoby';
  triggerAllResourcesButton.className = 'btn';

  triggerAllResourcesButton.addEventListener('click', function(event) {
    event.preventDefault();
    if (insertWoodButton) insertWoodButton.click();
    if (insertStoneButton) insertStoneButton.click();
    if (insertIronButton) insertIronButton.click();
  })

  resourcesTable.appendChild(triggerAllResourcesButton);
}

//Ratusz - tooltip na brakujące zasoby
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

//Attack planner
if(window.location.href.indexOf("screen=map") > -1){
  let intervalId;

  function startAttackPlanner(activationTime, time){
    if(!intervalId){
      console.log("Start!");
      intervalId = setInterval(() => {
        console.log("checking...")
        checkForBuildIn(activationTime);
      
      }, time);
    }
    let button = document.getElementById("triggerPlanner");
    button.textContent = "Dezaktywuj";
  }

  function stopAttackPlanner(){
    clearInterval(intervalId);
    intervalId = null;
    console.log("Stopped");

    let button = document.getElementById("triggerPlanner");
    button.textContent = "Aktywuj";
  }

  const addElements = () =>{
    let form = document.getElementById("command-data-form");
    let popup =  form.parentElement;
    const div = document.createElement('div');
    div.className = "plannerContainer";

    const label = document.createElement('label');
    label.setAttribute("for", "plannerTime");
    label.textContent = "Czas aktywacji (HH:MM:SS):";

    const input = document.createElement('input');
    input.setAttribute("type","time");
    input.setAttribute("id", "plannerTime");
    input.setAttribute("step", "1");
    input.value = "21:37";

    const intervalLabel = document.createElement('label');
    intervalLabel.setAttribute("for", "intervalData");
    intervalLabel.textContent = "Cyklicznie sprawdzaj co:";

    const intervalData = document.createElement('input');
    intervalData.setAttribute("type","number");
    intervalData.setAttribute("id", "intervalData");
    intervalData.setAttribute("step", "100");
    intervalData.value = "200";

    const button = document.createElement('button');
    button.id = 'triggerPlanner';
    button.className = 'btn';
    button.textContent = "Aktywuj";
    

    button.addEventListener('click', function(event){
      event.preventDefault();

      if(intervalId){
        stopAttackPlanner();
      }
      else{
        let intervalTime = document.getElementById("intervalData").value;
        let plannerTime = document.getElementById("plannerTime").value;
        startAttackPlanner(plannerTime, intervalTime);
      }
    })

    div.appendChild(label);
    div.appendChild(input);
    div.appendChild(intervalLabel);
    div.appendChild(intervalData);
    div.appendChild(button);

    popup.appendChild(div);
  }

  const checkForm = setInterval(() =>{
    const button = document.getElementById("troop_confirm_submit");
    if(button){
      clearInterval(checkForm);
      addElements();
    }
  }, 200);
}