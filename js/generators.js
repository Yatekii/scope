var audioContext = null;
var micOutput = null

function gotStream(stream) {
	console.log("Found a stream.");
    inputPoint = audioContext.createGain();

    // Create an AudioNode from the stream.
    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);

//    audioInput = convertToMono( input );

    zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect( zeroGain );
    zeroGain.connect( audioContext.destination );

	source = new Object();
	
	source.zeroGain = zeroGain;
	source.input = audioInput;
	source.output = inputPoint;
	// Create the analyzer node to be able to read sample output
	micTrace.analyzer = getAudioContext().createAnalyser();
	micTrace.analyzer.fftSize = 4096;
	// Connect the source output to the analyzer
	source.output.connect(micTrace.analyzer);
	// Create the data buffer
    micTrace.data = new Uint8Array(micTrace.analyzer.frequencyBinCount);
	micTrace.on = true;
	var fft = initRepr(FFTRepresentation, document.getElementById('trace-list'));
	var f = new FFTrace(scope, micTrace.analyzer, fft);
	scope.addTrace(f);
}

function initAudio() {
    navigator.getUserMedia({
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
        alert('Error getting audio!');
        console.log(e);
    });
}

function startOsc(time) {
	this.osc.start(time);
}

function stopOsc(time) {
	this.osc.stop(time);
}

function createSine(freq) {
	var audioContext = getAudioContext();
	var osc = audioContext.createOscillator();
	var output = audioContext.createGain();
	osc.type="sine";
	osc.frequency.value=freq;
	osc.connect(output);

	source = new Object();
	source.osc = osc;
	source.output = output;
	source.start = startOsc;
	source.stop = stopOsc;

	output.gain.value = 0.6;

	return source;
}

function createMic(stream){
	initAudio();
	micOutput = { mic: null };
	return micOutput;
}

function createNetworkSource(){
	/*
	var request = new XMLHttpRequest();
	request.open("GET", "sounds/techno.wav", true);
	request.responseType = "arraybuffer";
	request.onload = function() {
	  audioContext.decodeAudioData( request.response, function(buffer) { 
	    	myBuffer = buffer;
	    	appendOutput( "Sound ready." );
		} );
	}
	request.send();
*/
}

/*
 * Each source has to define an output and each, a start and a stop handler.
 * 
 */
function createSource(config) {
	switch(config.type){
		case 'mic':
			return createMic();
			break;
		case 'sine':
		default:
			return createSine(config.data.freq);
			break;
	}
}

function getAudioContext() {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	if(audioContext){
		return audioContext;
	}
	audioContext = new AudioContext();
	return audioContext;
}