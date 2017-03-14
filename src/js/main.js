
import * as source from './source.js';
import * as helpers from './helpers.js';
import * as trace from './trace.js';
import { router } from './nodes/router.js';

function init() {
    if (!navigator.getUserMedia)
        navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (!navigator.cancelAnimationFrame)
        navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
    if (!navigator.requestAnimationFrame)
        navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

    var audioContext = helpers.getAudioContext();
    // osc1.output.connect(audioContext.destination);
    // osc2.output.connect(audioContext.destination);
    var scope = new oscilloscope.Oscilloscope(document.getElementById('scope-container'), '100%', '256px');

    var osc1 = new source.Waveform(document.getElementById('node-tree-canvas'), scope);
    osc1.osc.frequency.value = 500;
    var osc2 = new source.Waveform(document.getElementById('node-tree-canvas'), scope);
    var mic = new source.Microphone(document.getElementById('node-tree-canvas'), scope);

    scope.addTrace(new trace.NormalTrace(
        document.getElementById('node-tree-canvas'), scope, osc1
    ));
    scope.addTrace(new trace.NormalTrace(
        document.getElementById('node-tree-canvas'), scope, osc2
    ));
    scope.traces[1].setColor('#E85D55');
    var micTrace = new trace.NormalTrace(
        document.getElementById('node-tree-canvas'), scope, mic
    );
    scope.addTrace(micTrace);
    var micFFT = new trace.FFTrace(
        document.getElementById('node-tree-canvas'), scope, mic
    );
    scope.addTrace(micFFT);
    mic.onactive = function onMicActive(source){
        micTrace.setSource(source);
        micFFT.setSource(source);
    };

    osc1.start(audioContext.currentTime+0.05);
    osc2.start(audioContext.currentTime+0.05);
    helpers.draw(scope);
}

window.addEventListener('load', init);