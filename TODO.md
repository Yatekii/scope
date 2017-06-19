- Fix moving markers
- Drag display to move active trace
    - fft simply gets moved
    - time traces will have the trigger location moved

- Calculate RMS of signal power

- Add an amplitude display for FFTrace

- Fix mithril warnings when displaying a NaN for marker position
    - why is it NaN -> Fix!

- Add an option to display half or the entire fourier spectrum

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