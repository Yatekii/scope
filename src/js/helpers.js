/*
 * This file contains various helper functions
*/
window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

export const draw = function(scope) {  
    if(scope) {
        scope.draw();
    }
    requestAnimationFrame(function(){
        draw(scope);
    });
};

export const withKey = function(key, callback) {
    return function(e) {
        if (e.keyCode == key) {
            callback(e.target);
        }
    };
};

/*
 * Capitalizes the first letter of a string
 * EXAMPLE: capitalizeFirstLetter('top kek') == 'Top kek'.
 * <string> : string : The string to captalize
 */
export const capitalizeFirstLetter = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

export const findIndicesOfMax = function(inp, count) {
    var outp = [];
    for (var i = 0; i < inp.length; i++) {
        outp.push(i); // add index to output array
        if (outp.length > count) {
            outp.sort(function(a, b) { return inp[b] - inp[a]; }); // descending sort the output array
            outp.pop(); // remove the last index (index of smallest element in output array)
        }
    }
    return outp;
};

export const median = function(values){
    values = values.slice(0);
    values.sort(function(a,b){
        return a-b;
    });
    var half = Math.floor(values.length / 2);

    if (values.length % 2)
        return values[half];
    else
        return (values[half - 1] + values[half]) / 2.0;
};

export const findPeaksAndTroughs = function(array) {
    var start = 1;                        // Starting index to search
    var end = array.length - 2;           // Last index to search
    var obj = { peaks: [], troughs: []  };// Object to store the indexs of peaks/thoughs
    
    for(var i = start; i<=end; i++)
    {
        var current = array[i];
        var last = array[i-1];
        var next = array[i+1];
        
        if(current > next && current > last) 
            obj.peaks.push(i);
        else if(current < next && current < last) 
            obj.troughs.push(i);
    }
    return obj;
};

export const findPeaksAbove = function(array, above) {
    var start = 1;                        // Starting index to search
    var end = array.length - 2;           // Last index to search
    var obj = { peaks: [], troughs: []  };// Object to store the indexs of peaks/thoughs
    
    for(var i = start; i<=end; i++)
    {
        var current = array[i];
        var last = array[i-1];
        var next = array[i+1];
        
        if(current > above && current > next && current > last) 
            obj.peaks.push(i);
    }
    return obj;
};