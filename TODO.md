- Add an amplitude display
- Make markers relative to the dataframe and not the screen
- Display trigger location
- Drag display to move active trace
    - fft simply gets moved
    - time traces will have the trigger location moved

- Fix General pref panel

- Calculate RMS of signal power

- SNR calculations
    - auto mode
        - calculate box width from window
        - remove half box with at dc
        - find max peak
        - calculate SNR
    - manual mode
        - calculate SNR between markers

- THD
    - TODO: add todo description ;)
    - fundamental carrier
    - num harmonics
        - sqare integrate