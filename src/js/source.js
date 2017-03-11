// Creates a new source
function Waveform(container, scope) {
    var me = this;

    // Assign class variables
    this.scope = scope;
    this.ready = false;

    // Create HTML representation
    var tr = createWaveformRepr('source-title-' + scope.sources.length, 'source-switch-' + scope.sources.length)
    this.repr = initRepr(tr, container);
    componentHandler.upgradeElement(this.repr);
    this.repr.controller = this;
    this.repr.id = 'source-' + scope.sources.length;

    // Find on-off switch
    this.on_off = this.repr.getElementsByClassName('trace-on-off')[0];
    this.on_off.onchange = function(event) { me.onSwitch(me, event); };
    this.on_off.checked = true;
    componentHandler.upgradeElement(this.on_off.parentElement);

    // Find repr title
    var title = this.repr.getElementsByClassName('card-title')[0];
    componentHandler.upgradeElement(title.parentElement);

    // Create source
    var audioContext = getAudioContext();
	this.osc = audioContext.createOscillator();
	this.output = audioContext.createGain();
	this.osc.type = 'sine';
	this.osc.frequency.value = 1000;
	this.osc.connect(this.output);
	this.output.gain.value = 1;

    this.start = startOsc;
    this.stop = stopOsc;

    // Create the analyzer
    this.analyzer = getAudioContext().createAnalyser();
    this.analyzer.fftSize = 4096;
    // Connect the source output to the analyzer
    this.output.connect(this.analyzer);
    this.ready = true;

    // Register with scope
    scope.addSource(this);
}

function startOsc(time) {
	this.osc.start(time);
}

function stopOsc(time) {
	this.osc.stop(time);
}

// Instantiates the GUI representation
createWaveformRepr = function(title_id, switch_id) {
    return `<div class="mdl-shadow--2dp trace-card">
            <div class="mdl-card__title">
                <i class="material-icons trace-card-icon">keyboard_capslock</i>&nbsp;
                <div class="mdl-textfield mdl-js-textfield">
                    <input class="mdl-textfield__input card-title" type="text" id="${ title_id }">
                    <label class="mdl-textfield__label" for="${ title_id }">Waveform</label>
                </div>
                <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="${ switch_id }">
                    <input type="checkbox" id="${ switch_id }" class="mdl-switch__input trace-on-off"/>
                </label>
            </div>
        </div>`;
}

// Activates the source on the scope
Waveform.prototype.onSwitch = function(source, event) {
    if(event.target.checked){
        this.osc.type = this.previousType;
	    this.osc.frequency.value = this.previousFrequency;
    } else {
        this.previousType = this.osc.type;
	    this.previousFrequency = this.osc.frequency.value;
        var real = new Float32Array(1);
        var imag = new Float32Array(1);
        real[0] = 0;
        imag[0] = 0;
        var wave = getAudioContext().createPeriodicWave(real, imag);
        this.osc.setPeriodicWave(wave);
    }
}

// Creates a new source
function Microphone(container, scope) {
    var me = this;

    // Assign class variables
    this.scope = scope;
    this.ready = false;
    this.onactive = null;

    // Create HTML representation
    var tr = createMicrophoneRepr('source-title-' + scope.sources.length, 'source-switch-' + scope.sources.length)
    var repr = initRepr(tr, container);
    componentHandler.upgradeElement(repr);
    this.repr = repr;
    repr.controller = this;
    this.repr.id = 'source-' + scope.sources.length;

     // Find on-off switch and store it
    this.on_off = this.repr.getElementsByClassName('trace-on-off')[0];
    this.on_off.onchange = function(event) { me.onSwitch(me, event); };
    this.on_off.checked = false;
    componentHandler.upgradeElement(this.on_off.parentElement);

    // Find repr title
    var title = this.repr.getElementsByClassName('card-title')[0];
    componentHandler.upgradeElement(title.parentElement);

    // Initialize audio
    initAudio(this);

    // Register with scope
    scope.addSource(this);
}

// Creates the actual audio source after a stream was found
gotStream = function(source, stream) {
	console.log("Found a stream.");

    // Create an AudioNode from the stream.
    source.input = audioContext.createMediaStreamSource(stream);

    // Connect to a gain from which the plots are derived
    source.traceGain = audioContext.createGain();
    source.input.connect(source.traceGain);

    // Connect to a gain which can be sinked
    source.sinkGain = audioContext.createGain();
    source.sinkGain.gain.value = 0.0;
    source.traceGain.connect(source.sinkGain);
    source.sinkGain.connect(audioContext.destination);

    // Create the analyzer
    source.analyzer = getAudioContext().createAnalyser();
    source.analyzer.fftSize = 4096;
    // Connect the source output to the analyzer
    source.traceGain.connect(source.analyzer);

    // Create the data buffer
    source.data = new Uint8Array(source.analyzer.frequencyBinCount);
    source.onactive(source);
	source.ready = true;
    source.on_off.checked = true;
    
}

// Requests an audio source
initAudio = function(source) {
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
    }, function(stream) { gotStream(source, stream); }, function(e) {
        console.log('Error getting audio!');
        console.log(e);
    });
}

Microphone.prototype.constructSource = function() {
    initAudio(this);
}

// Instantiates the GUI representation
createMicrophoneRepr = function(title_id, switch_id) {
    return `<div class="mdl-shadow--2dp trace-card">
            <div class="mdl-card__title">
                <i class="material-icons trace-card-icon">keyboard_tab</i>&nbsp;
                <div class="mdl-textfield mdl-js-textfield">
                    <input class="mdl-textfield__input card-title" type="text" id="${ title_id }">
                    <label class="mdl-textfield__label" for="${ title_id }">Microphone</label>
                </div>
                <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="${ switch_id }">
                    <input type="checkbox" id="${ switch_id }" class="mdl-switch__input trace-on-off"/>
                </label>
            </div>
        </div>`;
}

// Activates the source on the scope
Microphone.prototype.onSwitch = function(source, event) {
    if(event.target.checked){
        this.traceGain.gain.previousGain = this.previousGain;
    } else {
        this.previousGain = this.traceGain.gain.value;
        this.traceGain.gain.value = 0.0000001;
    }
}