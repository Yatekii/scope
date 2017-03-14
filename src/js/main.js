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

    jsPlumb.importDefaults({
        PaintStyle : {
            strokeWidth:13,
            stroke: 'rgba(200,0,0,0.5)'
        },
        DragOptions : { cursor: "crosshair" },
        Endpoints : [ [ "Dot", { radius:7 } ], [ "Dot", { radius:11 } ] ],
        EndpointStyles : [{ fill:"#225588" }, { fill:"#558822" }]
    });

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
            traces: [],
            sources: [],
            count: 0
        }
    };
    app.state = appState;
    m.mount(document.getElementById(conf.nodeTreeCanvas), { view: () =>
       m(app, { state: appState })
    });
    scope.traces.forEach(function(trace){
        app.addTrace(trace)
    });
    scope.sources.forEach(function(source){
        app.addSource(source)
    });


    //         jsPlumb.connect({
    //             source: trace.repr.id,
    //             target: scope.repr.id,
    //             endpoint: 'Dot',
    //             anchors: [['Right', {shape:'Circle'}], ['Left', {shape:'Circle'}]]
    //         });0

    // TODO: Crosswindow stuff
    // popup = window.open('http://fiddle.jshell.net');
    // popup.console.log(1);
    // popup.kek = 'KEK';
    // popup.alert(popup.kek);
}

window.addEventListener('load', init);