'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

let allData = [];
// //////////////////////////////////
// geolocation
// navigator.geolocation.getCurrentPosition(function(position){
//     console.log(position);
//     const latitude = position.coords.latitude
//     const longitude = position.coords.longitude
//     console.log(latitude,longitude);
//     console.log(`https://www.google.com/maps/@${longitude},${latitude}`);
// },function(e){
//     console.log(e);
//     alert('could not load map')
// })

// getCurrentPosition(success function(position) , error function)
// الميثود دس بتاخد 2 براميتر
// success fun ==>>>  اول واحد في حاله ان الفانكشن تمم وجاب اللوكيشن وكله تمم
// والفانكشن دي بتاخد براميتر .. ده اللي بيرجع فيه المعلومات كلها والاحداثيات وكل حاجة
//error fun ==>>> تاني واحدة في حاله ان حصل ايرور او مثلا اليوزر منع ان نستخدم الموقع بتاعه

// اللي هما خط الطول والعرض longitude & latitude  انا بقا اللي يهمني في المعلومات دي دلوقت هي
// اخدهم بقا واحطهم فجوجل مابس او استخدم مكتبه جاهزه بتجبلي اللوكيشن براحتك

// leaflet انا هنا هستخدم مكتبه اسمها

// /////////////////////////
// implementing map
let map, mapEvent;

  // //////////////////////////////////
// implementing map
navigator.geolocation?.getCurrentPosition(
  // success fun
  function (position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    map = L.map('map').setView([latitude, longitude], 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // L.marker([latitude, longitude])
    //   .addTo(map)
    //   .bindPopup('A pretty CSS popup.<br> Easily customizable.')
    //   .openPopup();

    map.on('click', e => {
      ///// reveal form
      mapEvent = e;
      form.classList.remove('hidden');
      inputDistance.focus();
    });
  },
  ///// error fun
  function (e) {
    console.log(e);
    alert('could not load map');
  }
);

// //////////////////////////////////
////// create Class
// prettier-ignore
const Workout = function (id,type,position,distance,duration,describe,speed,cadence,elev) {
  this.id = id;
  this.type = type;
  this.position = position
  this.dis = distance;
  this.dur = duration;
  this.describe = describe;
  this.speed = speed;
  this.cadence = cadence;
  this.elev = elev
};
// console.log(mapEvent);


///// check if values are numbers
const isNum = (...inputs) => inputs.every(inp => Number.isFinite(inp));

// //////////////////////////////////
// SHOW DATA FROM LOCAL STORAGE
// //////////////////////////////////
// implementing marker when form submitted
form.addEventListener('submit', e => {
  e.preventDefault();
  
/////////////// validate form
  let dis = +inputDistance.value;
  let dur = +inputDuration.value;
  let type = inputType.value;
  let caden=+inputCadence.value
  let elev=+inputElevation.value;
  if (type === 'running') {
    if (
      // !Number.isFinite(dis) ||
      // !Number.isFinite(dur) ||
      // !Number.isFinite(caden) ||
      ////// OR
      !isNum(dis, dur, caden) ||
      dis <= 0 ||
      caden <= 0 ||
      dur <= 0
    ) {
      return alert('values must be positive numbers!');
    }
  }

  if (type === 'cycling') {
    if (
      // !Number.isFinite(dis) ||
      // !Number.isFinite(dur) ||
      // !Number.isFinite(elev) ||
      !isNum(dis, dur, elev) ||
      dis <= 0 ||
      dur <= 0
    )
      return alert('values must be positive numbers!');
  }


/////// create instances form class
  const { lat, lng } = mapEvent.latlng;
  const id = (Date.now() + '').slice(-10);
  const description = `${
    type === 'running' ? 'Running' : 'Cycling'
  }  on ${new Date().toLocaleDateString()}`;
  const speed = (dis / dur).toFixed(1);
  const steps = (dur / dis).toFixed(1);
  const obj = new Workout(id, type,[lat,lng], dis, dur, description, speed, steps, elev);
  allData.push(obj);

  // store in local storage
  localStorage.setItem('data',JSON.stringify(allData))

/////// CREATE HTML
  let html = `
  <li class="workout workout--${obj.type}" data-id="${obj.id}">
      <h2 class="workout__title">${obj.describe}</h2>
      <div class="workout__details">
        <span class="workout__icon">${type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
        <span class="workout__value">${obj.dis}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${obj.dur}</span>
        <span class="workout__unit">min</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${obj.speed}</span>
        <span class="workout__unit">min/km</span>
      </div>
      
  `;
  if (type === 'running') {
    html += `
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${obj.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>
    `;
  } else {
    html += `
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${obj.elev}</span>
      <span class="workout__unit">m</span>
    </div>
  </li>
    `;
  }
  form.insertAdjacentHTML('afterend', html);

///////show marker
  // console.log(mapEvent.latlng);

  // console.log(lat, lng);

  L.marker([lat, lng])
    .addTo(map)
    .bindPopup(
      L.popup({
        maxWidth: 200,
        minWidth: 50,
        // closeButton:false,
        autoClose: false,
        closeOnClick: false,
        className: `${type}-popup`,
        content: `${type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${obj.describe}`,
      })
    )
    .openPopup();

  /////// fields empty && hide form
  const formAppearance = () => {
    // make inputs empty
    inputDistance.value=inputDuration.value=inputCadence.value=inputElevation.value=''

    // hide form
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  };
  formAppearance();
});

/////////////////////////
////// move map to popup

containerWorkouts.addEventListener('click',(e)=>{
  const workout_Ele = e.target.closest('.workout')
  console.log(workout_Ele);
  if(workout_Ele){
    const clicked = allData.find(ele=>ele.id === workout_Ele.dataset.id)
    console.log(clicked);

    map.setView(clicked.position,13,{
      animate:true,
      pan:{
        duration:1
      }
    })
    
  }
  
})
/////////////////////////
// change input
inputType.addEventListener('change', () => {
  inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
});
