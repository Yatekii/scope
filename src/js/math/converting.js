/*
 * This file holds helper functions to convert different unitspaces into one another.
 * It also conatins helpers to display numbers with proper physical units as a string.
 */

/*
 * Displays seconds as a properly formatted and scaled string with physical units.
 */
export const secondsToString = function(s){
    if(s < 1e-9){
        return (s * 1e12).toFixed(2) + 'ps';
    }
    if(s < 1e-6){
        return (s * 1e9).toFixed(2) + 'ns';
    }
    if(s < 1e-3){
        return (s * 1e6).toFixed(2) + 'us';
    }
    if(s < 1){
        return (s * 1e3).toFixed(2) + 'ms';
    }
    if(s < 1e3){
        return (s).toFixed(2) + 's';
    }
    if(s < 1e6){
        return (s * 1e-3).toFixed(2) + 'Ms';
    }
};

/*
 * Displays volts as a properly formatted and scaled string with physical units.
 */
export const voltsToString = function(v){
    if(v < 1e-9){
        return (v * 1e12).toFixed(2) + 'pV';
    }
    if(v < 1e-6){
        return (v * 1e9).toFixed(2) + 'nV';
    }
    if(v < 1e-3){
        return (v * 1e6).toFixed(2) + 'uV';
    }
    if(v < 1){
        return (v * 1e3).toFixed(2) + 'mV';
    }
    if(v < 1e3){
        return (v).toFixed(2) + 'V';
    }
    if(v < 1e6){
        return (v * 1e-3).toFixed(2) + 'MV';
    }
};

/*
 * Displays watts as a properly formatted and scaled string with physical units.
 */
export const wattsToString = function(w){
    if(w < 1e-9){
        return (w * 1e12).toFixed(2) + 'pW';
    }
    if(w < 1e-6){
        return (w * 1e9).toFixed(2) + 'nW';
    }
    if(w < 1e-3){
        return (w * 1e6).toFixed(2) + 'uW';
    }
    if(w < 1){
        return (w * 1e3).toFixed(2) + 'mW';
    }
    if(w < 1e3){
        return (w).toFixed(2) + 'W';
    }
    if(w < 1e6){
        return (w * 1e-3).toFixed(2) + 'MW';
    }
};

/*
 * Displays watts/hertz as a properly formatted and scaled string with physical units.
 */
export const wattsPerHertzToString = function(w){
    if(w < 1e-9){
        return (w * 1e12).toFixed(2) + 'pW/Hz';
    }
    if(w < 1e-6){
        return (w * 1e9).toFixed(2) + 'nW/Hz';
    }
    if(w < 1e-3){
        return (w * 1e6).toFixed(2) + 'uW/Hz';
    }
    if(w < 1){
        return (w * 1e3).toFixed(2) + 'mW/Hz';
    }
    if(w < 1e3){
        return (w).toFixed(2) + 'W/Hz';
    }
    if(w < 1e6){
        return (w * 1e-3).toFixed(2) + 'MW/Hz';
    }
};

/*
 * Displays hertz as a properly formatted and scaled string with physical units.
 */
export const hertzToString = function(f){
    if(f < 1e3){
        return (f).toFixed(2) + 'Hz';
    }
    if(f < 1e6){
        return (f * 1e-3).toFixed(2) + 'kHz';
    }
    if(f < 1e9){
        return (f * 1e-6).toFixed(2) + 'MHz';
    }
};

/*
 * Converts a sample number to the corresponding frequency.
 */
export const sampleToFrequency = function(sample, samplingRate, frameSize){
    return sample * samplingRate / frameSize;
};

/*
 * Converts a frequency number to the corresponding sample number.
 */
export const frequencyToSample = function(frequency, samplingRate, frameSize){
    return frequency * frameSize / samplingRate;
};

/*
 * Converts a sample number to the corresponding percentage of the entire frame.
 */
export const sampleToPercentage = function(sample, frameSize){
    return sample / frameSize;
};

/*
 * Converts a percentage of the entire frame to the corresponding sample number.
 */
export const percentageToSample = function(percentage, frameSize){
    return percentage * frameSize;
};