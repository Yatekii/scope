function NormalTrace(scope, source, defaultOn) {
    this.scope = scope;
    this.source = source;
    this.color = '#E8830C';
    this.fetched = false;
    this.on = defaultOn;
    this.colorpicker = null;
    this.title = null;
    this.icon = null;

    // Create HTML representation
    var tr = this.createTraceRepr('trace-title-' + scope.traces.length, 'trace-switch-' + scope.traces.length)
    var repr = initRepr(tr, document.getElementById('trace-list'));
    this.repr = repr;

    // Find on-off switch and store it
    var potentialButtons = document.getElementsByClassName('trace-on-off');
    for(i = 0; i < potentialButtons.length; i++){
        var x = potentialButtons[i];
        while (x = x.parentElement) { 
            if (x == repr){
                var me = this;
                potentialButtons[i].onchange = function(event) { me.onSwitch(me, event); };
                potentialButtons[i].checked = true;
                componentHandler.upgradeElement(potentialButtons[i].parentElement);
                break;
            }
        }
    }

    // Find color storage and store it
    var potentialInputs = document.getElementsByClassName('jscolor');
    for(i = 0; i < potentialInputs.length; i++){
        var x = potentialInputs[i];
        while (x = x.parentElement) { 
            if (x == repr){
                var me = this;
                this.colorpicker = new jscolor(potentialInputs[i],{
                    'value': this.color,
                    'hash': true
                });
                potentialInputs[i].value = this.color;
                potentialInputs[i].onchange = function(event) { me.setColor(event.target.value);  };
                break;
            }
        }
    }

    // Find repr title and store it
    var potentialTitles = document.getElementsByClassName('card-title');
    for(i = 0; i < potentialTitles.length; i++){
        var x = potentialTitles[i];
        while (x = x.parentElement) { 
            if (x == repr){
                this.title = potentialTitles[i];
                potentialTitles[i].style.color = this.color;
                componentHandler.upgradeElement(potentialTitles[i].parentElement);
                break;
            }
        }
    }

    // Find repr icon and store it
    var potentialIcons = document.getElementsByClassName('material-icons');
    for(i = 0; i < potentialIcons.length; i++){
        var x = potentialIcons[i];
        while (x = x.parentElement) { 
            if (x == repr){
                this.icon = potentialIcons[i];
                potentialIcons[i].style.color = this.color;
                break;
            }
        }
    }
    this.icon.onclick = this.colorpicker.show;

    if(source.output){
        // Create the analyzer node to be able to read sample output
        this.analyzer = getAudioContext().createAnalyser();
        this.analyzer.fftSize = 4096;
        // Connect the source output to the analyzer
        source.output.connect(this.analyzer);

        // Create the data buffer
        this.data = new Uint8Array(this.analyzer.frequencyBinCount);
    }
}

NormalTrace.prototype.createTraceRepr = function(title_id, switch_id) {
    return `<li class="mdl-list__item">
        <div class="mdl-card mdl-shadow--2dp trace-card">
            <div class="mdl-card__title">
                <i class="material-icons trace-card-icon">timeline</i>&nbsp;
                <div class="mdl-textfield mdl-js-textfield">
                    <input class="mdl-textfield__input card-title" type="text" id="${ title_id }">
                    <label class="mdl-textfield__label" for="${ title_id }">Trace</label>
                </div><input class="jscolor">
                <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="${ switch_id }">
                    <input type="checkbox" id="${ switch_id }" class="mdl-switch__input trace-on-off"/>
                </label>
            </div>
        </div>
    </li>`;
}

NormalTrace.prototype.setColor = function(color) {
    this.colorpicker.fromString(color)
    this.color = color;
    this.icon.style.color = this.color;
    this.title.style.color = this.color;
}

NormalTrace.prototype.onSwitch = function(trace, event) {
    trace.on = event.target.checked;
}

NormalTrace.prototype.fetch = function () {
    if(!this.fetched){
        this.analyzer.getByteTimeDomainData(this.data);
    }
    this.fetched = true;
}

NormalTrace.prototype.draw = function (triggerLocation) {
    // Make life easier with shorter variables
	var context = this.scope.canvas.getContext('2d');
    context.strokeWidth = 1;
    this.fetch();

    // Draw trace
	context.strokeStyle = this.color;
	context.beginPath();

	context.moveTo(0, (256 - this.data[triggerLocation]) * this.scope.scaling);
	for (var i=triggerLocation, j=0; (j < this.scope.canvas.width) && (i < this.data.length); i++, j++){
		context.lineTo(j, (256 - this.data[i]) * this.scope.scaling);
    }
	context.stroke();
    this.fetched = false;
}

function FFTrace(scope, analyzer) {
    this.scope = scope;
    this.analyzer = analyzer;
    this.color = '#E8830C';

    // Create HTML representation
    var tr = this.createTraceRepr('trace-title-' + scope.traces.length, 'trace-switch-' + scope.traces.length)
    var repr = initRepr(tr, document.getElementById('trace-list'));
    componentHandler.upgradeElement(repr);
    this.repr = repr;
    
    // Create the data buffer
    this.data = new Uint8Array(this.analyzer.frequencyBinCount);
    this.on = true;

    var potentialButtons = document.getElementsByClassName('trace-on-off');
    for(i = 0; i < potentialButtons.length; i++){
        var x = potentialButtons[i];
        while (x = x.parentElement) { 
            if (x == repr){
                var me = this;
                potentialButtons[i].onchange = function(event) { me.onSwitch(me, event); };
                potentialButtons[i].checked = true;
                componentHandler.upgradeElement(potentialButtons[i].parentElement);
                break;
            }
        }
    }

    // Find repr title and store it
    var potentialTitles = document.getElementsByClassName('card-title');
    for(i = 0; i < potentialTitles.length; i++){
        var x = potentialTitles[i];
        while (x = x.parentElement) { 
            if (x == repr){
                this.title = potentialTitles[i];
                potentialTitles[i].style.color = this.color;
                componentHandler.upgradeElement(potentialTitles[i].parentElement);
                break;
            }
        }
    }
}

FFTrace.prototype.createTraceRepr = function(title_id, switch_id) {
    return `<li class="mdl-list__item">
        <div class="mdl-card mdl-shadow--2dp trace-card">
            <div class="mdl-card__title">
                <i class="material-icons trace-card-icon">equalizer</i>&nbsp;
                <div class="mdl-textfield mdl-js-textfield">
                    <input class="mdl-textfield__input card-title" type="text" id="${ title_id }">
                    <label class="mdl-textfield__label" for="${ title_id }">FFT</label>
                </div>
                <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="${ switch_id }">
                    <input type="checkbox" id="${ switch_id }" class="mdl-switch__input trace-on-off"/>
                </label>
            </div>
        </div>
    </li>`;
}

FFTrace.prototype.setColor = function(color) {
    this.colorpicker.fromString(color)
    this.color = color;
}

FFTrace.prototype.onSwitch = function(trace, event) {
    trace.on = event.target.checked;
}

FFTrace.prototype.fetch = function () {
    if(!this.fetched){
        this.analyzer.getByteFrequencyData(this.data);
    }
    this.fetched = true;
}

FFTrace.prototype.draw = function (triggerLocation) {
    var SPACING = 1;
    var BAR_WIDTH = 1;
    var numBars = Math.round(this.scope.canvas.width / SPACING);
    var multiplier = this.analyzer.frequencyBinCount / numBars;

    var context = this.scope.canvas.getContext('2d');
    context.lineCap = 'round';

    this.fetch();

    // Draw rectangle for each frequency bin.
    for (var i = 0; i < numBars; ++i) {
        var magnitude = 0;
        var offset = Math.floor(i * multiplier);
        // gotta sum/average the block, or we miss narrow-bandwidth spikes
        for (var j = 0; j < multiplier; j++) {
            magnitude += this.data[offset + j];
        }
        magnitude = magnitude / multiplier;
        context.fillStyle = "hsl(" + Math.round((i*360)/numBars) + ", 100%, 50%)";
        context.fillRect(i * SPACING, this.scope.canvas.height, BAR_WIDTH, -magnitude);
    }
    this.fetched = false;
}
