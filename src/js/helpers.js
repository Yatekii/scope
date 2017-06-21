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
}