# Scope

This project aims to implement a fully capable oscilloscope using WebAudio and CanvasRenderingContext2D.

In an optimal final state it would feature sources from WebAudio (Wave Gens, Mic In, Audio Out) and from the Network.
Like this it would be possible to test filters inbetween Audio Out and Mic In with the Soundcard as a Wave Gen.
Enabling the network as well, one would be able to plot data from an FPGA/DSP board.

It would feature external triggering (the image is generated on an external source (FPGA/DSP) and sent to the app) and internal triggering with auto/normal mode and a variety of triggers (rising/falling edge) being able to display WebAudio sources.

Additionally special 'Math' traces which can do things like an FFT.

## Current Features
  - Multiple traces with each it's own source
  - Triggering on any source
  - Triggers
    - Rising edge
    - Falling edge
    - Normal mode
    - Auto mode

## Installing

To start off, `nodejs` and `yarn` need to be installed.

To install all required packages use `yarn install`.

To fire up the bundler and the webserver, use `yarn watch`.

Now visit the browser at `localhost:8080` and enjoy.