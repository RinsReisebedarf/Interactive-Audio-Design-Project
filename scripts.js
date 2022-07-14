const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioContext = null;

const sounds = ['Shield_01.mp3', 'Shield_02.mp3', 'Shield_03.mp3', 'Shield_04.mp3', 'Summoning_01.mp3', 'Summoning_02.mp3', 'Summoning_03.mp3', 'Summoning_04.mp3', 
'Ambi1.mp3', 'Ambi2.mp3', 'Dolphin.mp3', 'Pfiff_Mix.mp3', 'Track1_Success', 'Track2_Successs', 'Track_Fail'];
const hasLoop = [true, true, true, true, true, true, true, true, false, false, false, false, false, false, false];
const soundClasses = [1, 1, 1, 1, 2, 2, 2, 2, 0, 0, 0, 0];
const scores = [0, 0, 0]
const audioBuffers = [];
const sources = [];

window.addEventListener('mousedown', onPress);
window.addEventListener('touchstart', onPress);

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
function startSound(index) {

  const time = audioContext.currentTime;

  const loop = hasLoop[index];
  const source = audioContext.createBufferSource();
  const buffer = audioBuffers[index];
  let offset = 0;
  const fadeTime = 5;

  if (loop) {
    offset = time % (buffer.duration);
  }

  source.connect(audioContext.destination);
  source.buffer = buffer;
  source.loop = loop;
  source.start(time, offset);

  if (loop) {
    sources[index] = source;
  }
}

function stopSound(index) {
  const source = sources[index];

  if (source) {
    source.stop(audioContext.currentTime);
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

      stopSound(index);
      target.classList.remove('active');
    } else {
      startSound(index);
      target.classList.add('active');

      scores[classIndex]++;

      if (!hasLoop[index]) {
        setTimeout(() => target.classList.remove('active'), 250);
      }
    }

    console.log("scores:",scores);

  }

  evt.preventDefault();
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