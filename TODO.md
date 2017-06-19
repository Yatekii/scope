- Drag display to move active trace
    - fft simply gets moved
    - time traces will have the trigger location moved

- Add an option to display half or the entire fourier spectrum

-----------------------------------------------
R E S T R U C T U R E   C O D E
-----------------------------------------------

- SNR calculations
    - auto mode
        - calculate box width from window
        - remove half box with at dc
        - find max peak
        - calculate SNR
    - manual mode
        - calculate SNR between markers

- Fix all unit calculations
    - V amplitude
    - Freq amplitude
    - RMS
    - Maybe SNR

- THD
    - TODO: add todo description ;)
    - fundamental carrier
    - num harmonics
        - square integrate