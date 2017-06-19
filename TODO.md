- Fix moving markers
- Display trigger location
- Drag display to move active trace
    - fft simply gets moved
    - time traces will have the trigger location moved

- Fix General pref panel

- Calculate RMS of signal power

- Add an amplitude display for FFTrace

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