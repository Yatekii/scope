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
    t = new NormalTrace(scope, {output: inputPoint});
    scope.addTrace(t);

	source = new Object();
	
	source.zeroGain = zeroGain;
	source.input = audioInput;
	source.output = inputPoint;
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