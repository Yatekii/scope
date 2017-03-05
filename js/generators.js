var audioContext = null;

function start(time) {
	this.osc.start(time);
}
function stop(time) {
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
	source.start = start;
	source.stop = stop;

	output.gain.value = 1;  // purely for debugging.

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