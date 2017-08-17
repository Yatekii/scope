/*
 * This file contains various mathematical helper functions.
 */

/*
 * Calculate the sum of all elements in an array.
 * <arr> : int[] : An array-like containing all values to sum up
 */
export const sum = function(arr){
    var k = 0;
    for(var i = 0; i < arr.length; i++){
        k += arr[i];
    }
    return k;
};

/*
 * Calculate the quadratic sum of all elements in an array.
 * <arr> : int[] : An array-like containing all values to sum up
 */
export const ssum = function(arr){
    var k = 0;
    for(var i = 0; i < arr.length; i++){
        k += arr[i]*arr[i];
    }
    return k;
};

/*
 * Calculate the RMS of all elements in an array.
 * <arr> : int[] : An array-like containing all values to sum up
 */
export const rms = function(arr){
    return Math.sqrt(sum(arr) / arr.length);
};

/*
 * Calculate the Power Density of a signal.
 * <arr> : int[] : An array-like containing all values to sum up
 * <fs> : uint : The sample frequency
 * <half> : bool : Indicates wether <arr> contains the one-sided spectrum
 */
export const powerDensity = function(arr, fs, half, N){
    // const deltaf = fs / arr.length;
    // If it is the one-sided spectrum, we need a factor of two
    if(half){
        half = 2;
    } else {
        half = 1;
    }
    N = N ? N * half : (arr.length * half);
    return sum(arr) / (half * N * N * fs);
};

/*
 * Calculate the Power Density of a signal.
 * <arr> : int[] : An array-like containing all values to sum up
 * <half> : bool : Indicates wether <arr> contains the one-sided spectrum
 */
export const power = function(arr, N, fs){
    // If it is the one-sided spectrum, we need a factor of two

    // console.log(sum(arr), fs, N);
    // console.log('pwr:', sum(arr) * fs / N)
    return sum(arr) * fs / N;
};