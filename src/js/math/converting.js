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