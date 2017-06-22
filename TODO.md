+ Fix triggerLoc
- Fix trigger level sent (+ trace offset)
- Fix moving trace X

+ SNR calculations
    + auto mode
        + calculate box width from window
        + remove half box with at dc
        + find max peak
        + calculate SNR
    + manual mode
        + calculate SNR between markers

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

- Make trigger relative to chosen trace
- 2 Channel support