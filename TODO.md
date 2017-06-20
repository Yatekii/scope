-----------------------------------------------
R E S T R U C T U R E   C O D E
-----------------------------------------------

- Fix trigger level sent (+ trace offset)
- Make trigger relative to active trace
- FIx moving trace X

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