const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const chintamaniDays = [ 
  "રવિવાર - સ્વરૂપ ચિન્તામણી, નાથ નીરખ્યા છે",
  "સોમવાર - થાળ ચિન્તામણી, જમતા જોવાં છે",
  "મંગળવાર - લીલા ચિન્તામણી, ભુદર ભાળ્યા છે",
  "બુધવાર - દર્શન ચિન્તામણી, દ્રગે દીઠા છે",
  "ગુરુવાર - મહાત્મ્ય ચિન્તામણી, જીવન જાણું છે",
  "શુક્રવાર - સુખ ચિન્તામણી, સુખકારી છે",
  "શનિવાર - મૂર્તિ ચિન્તામણી, અયરજકારી છે",
];
const audioLinks = [
  'audio/chintamani-01.mp3', 'audio/chintamani-02.mp3', 'audio/chintamani-03.mp3',
  'audio/chintamani-04.mp3', 'audio/chintamani-05.mp3', 'audio/chintamani-06.mp3', 
  'audio/chintamani-07.mp3',
];

const scriptURL = 'https://script.google.com/macros/s/AKfycbxo9eEsOHjYybbaGpPlMlF5ZA1v0kgN3rGbK6Y8XRphzlqzt5vkFDyx3couRYHA8qGQ/exec';

const audioPlayer = document.getElementById('audioPlayer');
const startBtn = document.getElementById('startPath');
const newPathBtn = document.getElementById('newPath');
const statusMsg = document.getElementById('statusMsg');
const loginForm = document.querySelector('.login-form');
const lyricsDiv = document.getElementById('lyrics');
const totolPathDiv = document.getElementById('total-path');
const pathSelectContainer = document.querySelectorAll(".path-select .path");
const currentDay = document.getElementById('currentDay');


let lines = [];

const today = new Date();
const todayIndex = today.getDay();
const todayName = chintamaniDays[todayIndex];

let isAudioPlaying = false;
let pathData = JSON.parse(localStorage.getItem('harismrutiPath')) || [];

loadPath( todayIndex );

window.addEventListener('keydown', (e) => {
  if ([37, 39].includes(e.keyCode)) {
    e.preventDefault();
  }
});

document.addEventListener("DOMContentLoaded", (event) => {
  if (isLoggedIn()) {
    loginForm.style.cssText = "display: none !important";
  } else {
    document.querySelector('.tracker-card').style.display = "none";
    document.querySelector('.company').style.cssText = "display: none !important"
  }
});

pathSelectContainer.forEach( function(path){
  path.addEventListener('click', function(e){
    loadPath( parseInt( this.dataset.path ) );
  });
});

loginForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const loginFormData = new FormData(loginForm);
  localStorage.setItem('hsLogin', JSON.stringify(Object.fromEntries(loginFormData)))
  window.location.reload();
})

startBtn.addEventListener('click', () => {
  if (audioPlayer.paused) {
    audioPlayer.play();
    startBtn.textContent = "બંધ કરો / Pause Path";
    statusMsg.textContent = "Audio playing...";
  } else {
    audioPlayer.pause();
    startBtn.textContent = "શરુ કરો / Resume Path";
    statusMsg.textContent = "Audio paused.";
  }
});

audioPlayer.addEventListener('play', () => {
  isAudioPlaying = true;
});

audioPlayer.addEventListener('ended', () => {
  isAudioPlaying = false;
  statusMsg.textContent = "Audio completed! You can now click 'Complete Path'.";
  sendDataToSheet();
});



//Time Stemp
const currentTimeDisplay = document.getElementById('currentTime');
const remainingTimeDisplay = document.getElementById('remainingTime');

// Utility to format time in mm:ss
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Update times while playing
audioPlayer.addEventListener('timeupdate', () => {
  const current = audioPlayer.currentTime;
  const remaining = audioPlayer.duration - current;

  currentTimeDisplay.textContent = `⏱️ ${formatTime(current)}`;
  remainingTimeDisplay.textContent = `⌛ -${formatTime(remaining)}`;
});

function loadPath( audioIndex ){
  audioPlayer.src = audioLinks[audioIndex];
  console.log(audioLinks[audioIndex])
  loadLyrics(audioIndex);
  currentDay.textContent = `${chintamaniDays[audioIndex]}`;

  updateTotalPath();

  // checkAudioStatus();
  startBtn.textContent = "▶️ શરુ કરો / Resume Path";
  statusMsg.textContent = "Audio paused.";
}

// Load and parse .lrc file
function loadLyrics(number){
fetch(`lyrics/${number}_lyrics.lrc`)
  .then(res => res.text())
  .then(text => {
    lines = text.split('\n').map(l => {
      const match = l.match(/\[(\d+):(\d+\.\d+)\](.*)/);
      if (!match) return null;
      return {
        time: parseInt(match[1]) * 60 + parseFloat(match[2]),
        text: match[3].trim()
      };
    }).filter(Boolean);
    lyricsDiv.innerHTML = ''

    lines.forEach((ln, idx) => {
      const div = document.createElement('div');
      div.id = 'line-' + idx;
      div.className = 'lyric-line';
      div.textContent = ln.text;
      lyricsDiv.appendChild(div);
    });
  });
}

// Sync UI to audio
audioPlayer.addEventListener('timeupdate', () => {
  const current = audioPlayer.currentTime;
  let active = lines.findIndex((ln, i) =>
    current >= ln.time && (i === lines.length - 1 || current < lines[i + 1].time)
  );
  document.querySelectorAll('.lyric-line').forEach((el, i) => {
    if (i === active) {
      el.classList.add('active');
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      el.classList.remove('active');
    }
  });
});


function sendDataToSheet() {
  const formData = new FormData();
  let hsLogin = JSON.parse(localStorage.getItem('hsLogin'));
  formData.set('name', hsLogin.fullname);
  formData.set('date', hsLogin.mobile);
  formData.set('chintamani', `${todayName} Path`);

  fetch(scriptURL, {
    redirect: "follow",
    method: "POST",
    body: JSON.stringify(Object.fromEntries(formData)),
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
  }).then((e)=>{
    recordPath();
  })
}

function recordPath(){
  var pathCount = localStorage.getItem('pathCount');
  console.log(typeof(pathCount))
  if( pathCount == null ){
    pathCount = 0;
  }
  pathCount = parseInt(pathCount) + 1;
  localStorage.setItem('pathCount', pathCount);

  updateTotalPath();
}

function getTotalPath(){
  var pathCount = localStorage.getItem('pathCount');
  if( pathCount == null ){
    pathCount = 0;
  }
  return pathCount;
}

function updateTotalPath(){
  totolPathDiv.textContent = `જય સ્વામિનારાયણ, આપના કુલ ${getTotalPath()} પાઠ થયા છે.`
}

/**
 * Check if User is Logged In
 * @returns bool 
 */
function isLoggedIn() {
  const hsLogin = localStorage.getItem('hsLogin');
  console.log(hsLogin);
  return (hsLogin == null) ? false : true;
}

/**
 * Handles the mobile lock screen lock prevent automatically
 */

    let wakeLock = null;

    const requestWakeLock = async () => {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        console.log('Screen Wake Lock is active!');
      } catch (err) {
        console.error(`${err.name}, ${err.message}`);
      }
    };


    audioPlayer.addEventListener('play', () => {
      requestWakeLock();
    });

        audioPlayer.addEventListener('pause', () => {
      if (wakeLock !== null) {
        wakeLock.release();
        wakeLock = null;
        console.log('Screen Wake Lock is released!');
      }
    });

    audioPlayer.addEventListener('ended', () => {
      if (wakeLock !== null) {
        wakeLock.release();
        wakeLock = null;
        console.log('Screen Wake Lock is released!');
      }
    });