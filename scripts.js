const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext = null;

const validateButton = document.getElementById("validate");

//const sounds = ['Shield_01.mp3', 'Shield_02.mp3', 'Shield_03.mp3', 'Shield_04.mp3', 'Summoning_01.mp3', 'Summoning_02.mp3', 'Summoning_03.mp3', 'Summoning_04.mp3', 
//'Ambi1.mp3', 'Ambi2.mp3', 'Dolphin.mp3', 'Pfiff_Mix.mp3', 'Track1_Success.mp3', 'Track2_Success.mp3', 'Track_Fail.mp3'];

const sounds = ['Track1_1.mp3', 'Track1_2.mp3', 'Track1_3.mp3', 'Track1_4.mp3', 'Track2_1.mp3', 'Track2_2.mp3', 'Track2_3.mp3', 'Track2_4.mp3', 
'Ambi1.mp3', 'Ambi2.mp3', 'Dolphin.mp3', 'Pfiff_Mix.mp3', 'Track1_Success.mp3', 'Track2_Success.mp3', 'Track_Fail.mp3'];

const hasLoop = [true, true, true, true, true, true, true, true, false, false, false, false, false, false, false];
const soundClasses = [1, 1, 1, 1, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0];
const scores = [0, 0, 0]
const audioBuffers = [];
const sources = [];
const gains = [];
let numPlaying = 0;
const fadeTime = 0.1;
let loopDuration = 9.6;

window.addEventListener('mousedown', onPress);
window.addEventListener('touchstart', onPress);

validateButton.addEventListener('click', onValidate);

// load audio buffers (samples)
for (let i = 0; i < sounds.length; i++) {
  const request = new XMLHttpRequest();
  request.responseType = 'arraybuffer';
  request.open('GET', 'sounds/' + sounds[i]);
  request.addEventListener('load', () => {
    const ac = new AudioContext();
    ac.decodeAudioData(request.response, (buffer) => audioBuffers[i] = buffer);
  });

  request.send();
}

// play buffer by index
function startSound(index, loop, loopDuration, inPhase) {

  const time = audioContext.currentTime;
  const gain = audioContext.createGain();
  gain.connect(audioContext.destination);
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(1, time+fadeTime);

  const source = audioContext.createBufferSource();
  const buffer = audioBuffers[index];
  let offset = 0;

  if (inPhase) {
    offset = time % (loopDuration);
  }

  source.connect(gain);
  source.buffer = buffer;
  source.loop = loop;
  source.start(time, offset);

  if (loop) {
    sources[index] = source;
    gains[index] = gain;
  }
}

function stopSound(index) {
  const source = sources[index];
  const gain = gains[index];
  const time = audioContext.currentTime;

  if (source) {
    gain.gain.setValueAtTime(1, time);
    gain.gain.linearRampToValueAtTime(0, time+fadeTime);
    source.stop(time + fadeTime);
    sources[index] = null;
  }
}

// play audio buffer (loop)
function onPress(evt) {
  const target = evt.target;
  const index = target.dataset.index;

  // create audio context on first mouse-press/click/touch and keep it
  if (audioContext === null) {
    audioContext = new AudioContext();
  }

  if (index !== undefined) {
    const classIndex = soundClasses[index];
    if (sources[index]) {

      scores[classIndex]--;
      numPlaying--;

      if (numPlaying<4){
        validateButton.classList.remove ("active");
      }

      stopSound(index);
      target.classList.remove('active');
    } else {
      const loop = hasLoop[index];
      startSound(index, loop, loopDuration, loop);
      target.classList.add('active');

      scores[classIndex]++;
      
      if (hasLoop[index]) {
        numPlaying++;
        if (numPlaying>=4){
          validateButton.classList.add ("active");
        }
      }
      else {
        setTimeout(() => target.classList.remove('active'), 250);
      }
    }

    console.log("scores:",scores);
  }

  evt.preventDefault();
}

function onValidate (){
  if (numPlaying>=4) {
    let validateClass = 0;
    if (scores[1] === 4 && numPlaying === 4) {
      startSound(12, false, loopDuration, true);
      validateClass = 1;
    } else if (scores[2] === 4 && numPlaying === 4) {
      startSound(13, false, loopDuration, true);
      validateClass = 2
    } else {
      startSound(14, false, loopDuration, true);
    }
    numPlaying = 0;
    validateButton.classList.remove ("active");
    validateSounds(12, -1);
    scores[0] = 0;
    scores[1] = 0;
    scores[2] = 0;
  }
}

function validateSounds(num, validateClass) {
  for (let i = 0; i<num; i++) {
    const soundClass = soundClasses[i];
    stopSound(i);
    const button = document.querySelector(`[data-index="${i}"]`);
    if(soundClass===validateClass) {
      button.classList.add ("valid");
    } else{
      button.classList.add("invalid");
    }
  }
}

// 'const AudioContext = window.AudioContext || window.webkitAudioContext;
// let audioContext = null;

// const sounds = ['perc.wav', 'bass.wav', 'harm.wav', 'melo.wav'];
// const levels = [0, 0, -3, -10];
// const loops = [];
// const activeLoops = new Set();
// let loopStartTime = 0;
// const fadeTime = 0.050;

// window.addEventListener('mousedown', onButton);
// window.addEventListener('touchstart', onButton);

// loadLoops();

// /***************************************************************************/

// class Loop {
//   constructor(buffer, button, level = 0) {
//     this.buffer = buffer;
//     this.button = button;
//     this.amp = decibelToLinear(level);
//     this.gain = null;
//     this.source = null;
//     this.analyser = null;
//   }

//   start(time, sync = true) {
//     const buffer = this.buffer;
//     let analyser = this.analyser;
//     let offset = 0;

//     if (analyser === null) {
//       analyser = audioContext.createAnalyser();
//       this.analyser = analyser;
//       this.analyserArray = new Float32Array(analyser.fftSize);
//     }

//     const gain = audioContext.createGain();
//     gain.connect(audioContext.destination);
//     gain.connect(analyser);

//     if (sync) {
//       // fade in only when starting somewhere in the middle
//       gain.gain.value = 0;
//       gain.gain.setValueAtTime(0, time);
//       gain.gain.linearRampToValueAtTime(this.amp, time + fadeTime);

//       // set offset to loop time
//       offset = (time - loopStartTime) % buffer.duration;
//     }

//     const source = audioContext.createBufferSource();
//     source.connect(gain);
//     source.buffer = buffer;
//     source.loop = true;
//     source.start(time, offset);

//     this.source = source;
//     this.gain = gain;

//     activeLoops.add(this);
//     this.button.classList.add('active');
//   }

//   stop(time) {
//     this.source.stop(time + fadeTime);
//     this.gain.gain.setValueAtTime(this.amp, time);
//     this.gain.gain.linearRampToValueAtTime(0, time + fadeTime);

//     this.source = null;
//     this.gain = null;

//     activeLoops.delete(this);
//     this.button.classList.remove('active');
//     this.button.style.opacity = 0.25;
//   }

//   displayIntensity() {
//     const analyser = this.analyser;

//     if (analyser.getFloatTimeDomainData) {
//       const array = this.analyserArray;
//       const fftSize = analyser.fftSize;

//       analyser.getFloatTimeDomainData(array);

//       let sum = 0;
//       for (let i = 0; i < fftSize; i++) {
//         const value = array[i];
//         sum += (value * value);
//       }

//       const opacity = Math.min(1, 0.25 + 10 * Math.sqrt(sum / fftSize));
//       this.button.style.opacity = opacity;
//     }
//   }

//   get isPlaying() {
//     return (this.source !== null);
//   }
// }

// function loadLoops() {
//   const decodeContext = new AudioContext();

//   // load audio buffers
//   for (let i = 0; i < sounds.length; i++) {
//     const request = new XMLHttpRequest();
//     request.responseType = 'arraybuffer';
//     request.open('GET', 'sounds/' + sounds[i]);
//     request.addEventListener('load', () => {
//       decodeContext.decodeAudioData(request.response, (buffer) => {
//         const button = document.querySelector(`div.button[data-index="${i}"]`);
//         loops[i] = new Loop(buffer, button, levels[i])
//       });
//     });

//     request.send();
//   }
// }

// function onButton(evt) {
//   const target = evt.target;
//   const index = target.dataset.index;
//   const loop = loops[index];

//   if (audioContext === null)
//     audioContext = new AudioContext();

//   if (loop) {
//     const time = audioContext.currentTime;
//     let syncLoopPhase = true;

//     if (activeLoops.size === 0) {
//       loopStartTime = time;
//       syncLoopPhase = false;
//       window.requestAnimationFrame(displayIntensity);
//     }

//     if (!loop.isPlaying) {
//       loop.start(time, syncLoopPhase);
//     } else {
//       loop.stop(time);
//     }
//   }
// }

// function displayIntensity() {
//   for (let loop of activeLoops)
//     loop.displayIntensity();

//   if (activeLoops.size > 0)
//     window.requestAnimationFrame(displayIntensity);
// }

// function decibelToLinear(val) {
//   return Math.exp(0.11512925464970229 * val); // pow(10, val / 20)
// }'