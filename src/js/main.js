import m from 'mithril';
import * as jp from 'jsplumb';
import * as oscilloscope from './oscilloscope';
import * as source from './source.js';
import * as helpers from './helpers.js';
import * as trace from './trace.js';
import * as conf from './conf.js';
import { app } from './nodes/app.js';

import '../css/main.css';

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

    var appState = {
        nodes: {
            traces: [{
                id: 0,
                name: 'Trace ' + 0,
                top: 250,
                left: 350,
                source: { id: 4}
            },
            {
                id: 1,
                name: 'Trace ' + 1,
                top: 350,
                left: 350,
                source: { id: 5}
            },
            {
                id: 2,
                name: 'Trace ' + 2,
                top: 450,
                left: 350,
                source: { id: 6}
            },
            {
                id: 3,
                name: 'Trace ' + 3,
                top: 550,
                left: 350,
                source: { id: 6}
            }],
            sources: [{
                id: 4,
                name: 'Source ' + 4,
                top: 250,
                left: 50,
                type: 'Waveform',
            },
            {
                id: 5,
                name: 'Source ' + 5,
                top: 430,
                left: 50,
                type: 'Waveform',
            },
            {
                id: 6,
                name: 'Source ' + 6,
                top: 600,
                left: 50,
                type: 'Microphone',
            }],
            scopes: [{
                id: 7,
                name: 'Scope ' + 7,
                top: 450,
                left: 650,
                traces: { ids: [0, 1, 2, 3] }
            }],
            count: 8
        }
    };
    app.state = appState;
    m.mount(document.getElementById(conf.nodeTreeCanvas), { view: () =>
       m(app, appState)
    });

    // TODO: Crosswindow stuff
    // popup = window.open('http://fiddle.jshell.net');
    // popup.console.log(1);
    // popup.kek = 'KEK';
    // popup.alert(popup.kek);
}

window.addEventListener('load', init);