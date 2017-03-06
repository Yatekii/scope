var audioContext = null;

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
	var audioContext = getAudioContext();
	var mic = audioContext.createMediaStreamSource(stream);
	var output = audioContext.createGain();

	mic.connect(output);
	output.connect(audioContext.destination);

	source = new Object();
	source.mic = mic;
	source.output = output;

	output.gain.value = 600;  // purely for debugging.

	return source;
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
			return createMic(config.data.stream);
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