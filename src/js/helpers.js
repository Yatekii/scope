window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;


export const draw = function(scope) {  
    if(scope) {
        scope.draw();
    }
    requestAnimationFrame(function(){
        draw(scope);
    });
};

export const htmlToElement = function(html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
};

export const initRepr = function(html, container) {
    var element = htmlToElement(html);
    if(container) {
        container.appendChild(element);
    } else {
        document.body.appendChild(element);
    }
    return element;
};

var audioContext = null;
export const getAudioContext = function() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    if(audioContext){
        return audioContext;
    }
    audioContext = new AudioContext();
    return audioContext;
};

export const withKey = function(key, callback) {
    return function(e) {
        if (e.keyCode == key) {
            callback(e.target);
        }
    }
};

export const getNodeByID = function(nodes, id){
    var result = nodes.filter(function( obj ) {
        return obj.id == id;
    });
    return result;
}