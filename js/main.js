function init() {
    osc1=createSource({type: 'sine', data: { freq: 220}});
    osc2=createSource({type: 'sine', data: { freq: 440}});
    mic = null;
    audioContext = getAudioContext();
    osc1.output.connect(audioContext.destination);
    osc2.output.connect(audioContext.destination);
    scope = new Oscilloscope(null, '100%', '256px', [osc1, osc2]);
    osc1.start(audioContext.currentTime+0.05);
    osc2.start(audioContext.currentTime+0.05);
    setupCanvases();
    draw(scope);
    if (navigator.mediaDevices) {
    	console.log('getUserMedia supported.');
		navigator.mediaDevices.getUserMedia({audio: true}, function(stream) {
			mic=createSource({type: 'mic', data: { stream: stream }});
            mic.output.connect(audioContext.destination);
            scope.addTrace(new Trace(scope, mic));
		}, function(error) {
            console.log(error);
        })
	} else {
		console.log('getUserMedia not supported on your browser!');
	}
    triggerLevel = document.getElementById('trigger-level');
    triggerLevel.onchange = function(){triggerLevelChange(scope);};
    triggerLevel.oninput = function(){triggerLevelChange(scope);};
}

window.addEventListener("load", init);