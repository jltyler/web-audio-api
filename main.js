// Button elements
const playButton = document.getElementById('play')
const loopButton = document.getElementById('loop')
const stopButton = document.getElementById('stop')
const playOscButton = document.getElementById('play-osc')
const stopOscButton = document.getElementById('stop-osc')

// Display elements
const volumeDisplay = document.getElementById('volume-display')
const volumeOscDisplay = document.getElementById('volume-osc-display')
const playbackDisplay = document.getElementById('playback-display')
const frequencyDisplay = document.getElementById('frequency-display')
const osc1Display = document.getElementById('osc1-display')
const osc2Display = document.getElementById('osc2-display')

// Canvas elements for visuals
const canvas = document.querySelector('.visualizer')
const canvasCtx = canvas.getContext("2d")

// AudioContext for all the sounds
const audioContext = new window.AudioContext()

// So we can use the mouse position for effects
const HEIGHT = window.innerHeight
const WIDTH = window.innerWidth

// Master volume
const mainGainNode = audioContext.createGain()
mainGainNode.gain.value = 0.5
mainGainNode.connect(audioContext.destination)

// Analyser node for visualizing sound data
const analyser = audioContext.createAnalyser()
analyser.connect(mainGainNode)

// Lowpass filter
const filter = audioContext.createBiquadFilter()
filter.type = 'lowpass'
filter.Q = 1.0
filter.connect(analyser)

// Oscillator volume (since they can be very loud and annoying)
const oscGainNode = audioContext.createGain()
oscGainNode.gain.value = 0.3
oscGainNode.connect(filter)

// Audio visualizer
const CANVAS_WIDTH = canvas.width
const CANVAS_HEIGHT = canvas.height
analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
canvasCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
var draw = function() {
  drawVisual = requestAnimationFrame(draw)
  analyser.getByteFrequencyData(dataArray)
  canvasCtx.fillStyle = 'rgb(0, 0, 0)'
  canvasCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  const barWidth = (CANVAS_WIDTH / bufferLength) * 2.5
  let barHeight
  let x = 0
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i]
    canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)'
    canvasCtx.fillRect(x,CANVAS_HEIGHT-barHeight/2,barWidth,barHeight/2)
    x += barWidth + 1
  }
}
draw()

// Declare oscillator vars ahead of time
let mainOsc
let otherOsc

// Will hold the sound buffer once a sound is loaded
let soundBuffer
// Will hold sound source node
let soundBufferSource

// We have a playing variable so we can avoid playing multiple
// oscillators at once
let playing = false

// Create oscillators function
// Oscillators can only be used once so we need to recreate them each time
const newOscillator = function () {
  mainOsc = audioContext.createOscillator()
  mainOsc.type = document.getElementById('waveform').value
  mainOsc.frequency.value = 440
  mainOsc.connect(oscGainNode)
  otherOsc = audioContext.createOscillator()
  otherOsc.type = document.getElementById('waveform').value
  otherOsc.frequency.value = 440
  otherOsc.connect(oscGainNode)
}

// This event fires every time the mouse moves
document.onmousemove = function (e) {
  // Get mouse position
  let y = e.pageY
  let x = e.pageX
  // console.log(x, ', ', y)
  // Change oscillator frequency but only if they are playing
  if (playing) {
    mainFreq = 220 + x
    otherFreq = 220 + x * 1.2
    mainOsc.frequency.value = mainFreq
    otherOsc.frequency.value = otherFreq
    osc1Display.innerHTML = 'Osc1 frequency: ' + mainFreq.toFixed(2)
    osc2Display.innerHTML = 'Osc2 frequency: ' + otherFreq.toFixed(2)
  }
  // Change filter frequency cutoff based on mouse y position
  const cutoff = (y / HEIGHT) * 6000
  filter.frequency.value = cutoff
  frequencyDisplay.innerHTML = 'Frequency cutoff: ' + cutoff.toFixed(3)
  // Change sound speed based on mouse x but only if it exists
  if (soundBufferSource) {
    const rate = 0.3 + (x/WIDTH) * 1.5
    soundBufferSource.playbackRate.value = rate
    playbackDisplay.innerHTML = 'Playback rate: ' + rate.toFixed(3)
  }
}

// Attach events to controls
// Loading a sound file
document.getElementById('audio-file').onchange = function (e) {
  const reader = new FileReader()
  // Reader callback function when a file is finished loading
  reader.onload = function(ev) {
    audioContext.decodeAudioData(ev.target.result, function(buffer) {
      // Store buffer into our var we declared earlier
      soundBuffer = buffer
    })
  }
  reader.readAsArrayBuffer(this.files[0]);
}

// Play button click event
playButton.onclick = function (e) {
  // Only play sound source if something is in the buffer
  if (soundBuffer) {
    soundBufferSource = audioContext.createBufferSource()
    soundBufferSource.buffer = soundBuffer
    soundBufferSource.connect(filter)
    soundBufferSource.start()
  }
}

// Loop button clicked event
loopButton.onclick = function (e) {
  if (soundBuffer) {
    soundBufferSource = audioContext.createBufferSource()
    soundBufferSource.buffer = soundBuffer
    soundBufferSource.loop = true
    soundBufferSource.connect(filter)
    soundBufferSource.start()
    // We disable buttons because if we clicked again we wouldn't be able to
    // stop the previous loop
    playButton.disabled = true
    loopButton.disabled = true
  }
}

// Stop button clicked event
stopButton.onclick = function (e) {
  if (soundBufferSource) {
    soundBufferSource.stop()
  }
  playButton.disabled = false
  loopButton.disabled = false
}

// Oscillator events
// Start oscillators event
playOscButton.onclick = function (e) {
  // We don't want to play the oscillators if they are already playing since
  // we will lose the reference to them with newOscillator
  // If we didn't do this we would be unable to stop the oscillators and
  // they would blast our eardrums to bits forever
  if (!playing) {
    newOscillator()
    mainOsc.start()
    otherOsc.start()
    playing = true
    stopOscButton.disabled = false
    playOscButton.disabled = true
  }
}

// Stop oscillators event
stopOscButton.onclick = function (e) {
  if (playing) {
    mainOsc.stop()
    otherOsc.stop()
    playing = false
    stopOscButton.disabled = true
    playOscButton.disabled = false
  }
}

// Pause simply disconnects the main volume node from the output node
document.getElementById('pause').onclick = function (e) {
  mainGainNode.disconnect(audioContext.destination)
}

// And unpause reconnects it
document.getElementById('unpause').onclick = function (e) {
  mainGainNode.connect(audioContext.destination)
}

// Volume slider
document.getElementById('volume').onchange = function (e) {
  volumeDisplay.innerHTML = e.target.value + '%'
  mainGainNode.gain.value = e.target.value / 100
}

// Volume slider for oscillators
document.getElementById('volume-osc').onchange = function (e) {
  volumeOscDisplay.innerHTML = e.target.value + '%'
  oscGainNode.gain.value = e.target.value / 100
}
