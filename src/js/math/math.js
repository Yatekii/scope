export const sum = function(arr){
    var k = 0;
    for(var i = 0; i < arr.length; i++){
        k += arr[i];
    }
    return k;
};

export const ssum = function(arr){
    var k = 0;
    for(var i = 0; i < arr.length; i++){
        k += arr[i]*arr[i];
    }
    return k;
};

export const rms = function(arr){
    return Math.sqrt(ssum(arr) / arr.length);
}