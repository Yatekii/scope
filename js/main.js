function gotStream(stream) {
    inputPoint = audioContext.createGain();

    // Create an AudioNode from the stream.
    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);

//    audioInput = convertToMono( input );

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    inputPoint.connect( analyserNode );

    zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect( zeroGain );
    zeroGain.connect( audioContext.destination );
    t = new NormalTrace(scope, {output: inputPoint});
    scope.addTrace(t);
}

function initAudio() {
        if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (!navigator.cancelAnimationFrame)
            navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
        if (!navigator.requestAnimationFrame)
            navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

    navigator.getUserMedia(
        {
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, gotStream, function(e) {
            alert('Error getting audio');
            console.log(e);
        });
}

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
    draw(scope);
    
    initAudio();

    triggerLevel = document.getElementById('trigger-level');
    triggerLevel.onchange = function(){
        triggerLevelChange(scope);
        document.getElementById('trigger-level-bar').value = document.getElementById('trigger-level').value
    };
    triggerLevel.oninput = function(){
        triggerLevelChange(scope);
        document.getElementById('trigger-level-bar').value = document.getElementById('trigger-level').value
    };

    triggerLevel = document.getElementById('trigger-level-bar');
    triggerLevel.onchange = function(){
        triggerLevelChange(scope);
        document.getElementById('trigger-level').value = document.getElementById('trigger-level-bar').value
    };
    triggerLevel.oninput = function(){
        triggerLevelChange(scope);
        document.getElementById('trigger-level').value = document.getElementById('trigger-level-bar').value
    };
}

window.addEventListener("load", init);