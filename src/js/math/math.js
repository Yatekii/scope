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