var micTrace = null;
function init() {
    if (!navigator.getUserMedia)
        navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (!navigator.cancelAnimationFrame)
        navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
    if (!navigator.requestAnimationFrame)
        navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

    audioContext = getAudioContext();
    // osc1.output.connect(audioContext.destination);
    // osc2.output.connect(audioContext.destination);
    scope = new Oscilloscope(document.getElementById('scope-container'), '100%', '256px');

    osc1 = new Waveform(document.getElementById('active-sources'), scope);
    osc1.osc.frequency.value = 500;
    osc2 = new Waveform(document.getElementById('active-sources'), scope);
    mic = new Microphone(document.getElementById('active-sources'), scope);

    scope.addTrace(new NormalTrace(
        scope, osc1
    ));
    scope.addTrace(new NormalTrace(
        scope, osc2
    ));
    scope.traces[1].setColor('#E85D55');
    var micTrace = new NormalTrace(
        scope, mic
    );
    scope.addTrace(micTrace);
    var micFFT = new FFTrace(
        scope, mic
    );
    scope.addTrace(micFFT);
    mic.onactive = function onMicActive(source){
        micTrace.setSource(source);
        micFFT.setSource(source);
    };

    var sourcesDrake = dragula([document.getElementById('available-sources'), document.getElementById('active-sources')], {
        copy: function (el, source) {
            return source === document.getElementById('available-sources');
        },
        accepts: function (el, target) {
            return target !== document.getElementById('available-sources');
        }
    });

    var draggedOriginal = null
    sourcesDrake.on('cloned', function(clone, original, type) {
        draggedOriginal = original;
    });
    sourcesDrake.on('drop', function(el, target, source, sibling) {
        
    });
    osc1.start(audioContext.currentTime+0.05);
    osc2.start(audioContext.currentTime+0.05);
    draw(scope);
}

window.addEventListener("load", init);