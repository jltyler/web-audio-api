# Web Audio API
## What is this
This is a small repo and set of files to demonstrate a (small) number of things that the Web Audio API is capable of. Only meant as a demonstration and not necessarily a teaching tool.

## How to use it
At the top in the black area is a canvas element that will show a bar graph of the frequencies being played. This only displays when sound is coming through the analyser node that is part of the web app.

Pause and unpause will cease the audio and continue it. These work by disconnecting the main volume (gainNode) from the audioContext destination and then reconnecting it. The audio will stop rendering since it has nowhere to go.

The audio controls will let you play a file that you chose and loop it if needed. Note that they will do nothing until you choose an audio file.

The oscillators control area will let you choose what type of oscillators will play and independently adjust the volume for them.

Everything below is just information being displayed.

## Mouse controls
The mouse X position controls the 2 oscillators' frequencies. One is slightly offset from the other.
The mouse X position will also control the playback rate of the sound sample. This will also affect the pitch.
The mouse Y position will change the cutoff frequency for the lowpass filter. Moving the mouse to a higher position on the page will lower the cut off and filter out more of the higher frequencies
