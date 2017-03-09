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

    osc1 = new Waveform(document.getElementById('sources-active'), scope);
    osc1.osc.frequency.value = 500;
    osc2 = new Waveform(document.getElementById('sources-active'), scope);
    mic = new Microphone(document.getElementById('sources-active'), scope);

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

    var sourcesDrake = dragula([document.getElementById('sources-available'), document.getElementById('sources-active')], {
        copy: function (el, source) {
            return source === document.getElementById('sources-available');
        },
        accepts: function (el, target) {
            return target !== document.getElementById('sources-available');
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

    jsPlumb.ready(function(){
        scope.traces.forEach(function(trace) {
            console.log(trace.source.repr.id);
            console.log(trace.repr.id)
            jsPlumb.addEndpoint(trace.source.repr.id, { 
                anchor: ["Left", {shape:"Circle"}],
                isSource: true,
            });
            jsPlumb.addEndpoint(trace.repr.id, {
                anchor: ["Right", {shape:"Circle"}],
                isTarget: true,
            });
            jsPlumb.connect({
                source: trace.source.repr.id,
                target: trace.repr.id,
                endpoint: "Dot",
                anchors: [["Left", {shape:"Circle"}], ["Right", {shape:"Circle"}]]
            });
        });
    });
}

function drawUI() {

}

window.addEventListener("load", init);