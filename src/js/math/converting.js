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
}

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
}

export const voltsToString = function(V){
    return (V).toFixed(2) + 'V';
};

export const sampleToFrequency = function(sample, samplingRate, frameSize){
    return sample * samplingRate / frameSize;
};

export const frequencyToSample = function(frequency, samplingRate, frameSize){
    return frequency * frameSize / samplingRate;
};

export const sampleToPercentage = function(sample, frameSize){
    return sample / frameSize;
};

export const percentageToSample = function(percentage, frameSize){
    return percentage * frameSize;
};