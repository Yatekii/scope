function Trace(scope, source) {
    this.scope = scope;
    this.source = source;
    this.color = '#E8830C';
    this.fetched = false;

    // Create the analyzer node to be able to read sample output
    this.analyzer = getAudioContext().createAnalyser();
    this.analyzer.fftSize = 4096;
    // Connect the source output to the analyzer
    source.output.connect(this.analyzer);

    // Create the data buffer
    this.data = new Uint8Array(this.analyzer.frequencyBinCount);
}

Trace.prototype.fetch = function () {
    if(!this.fetched){
        this.analyzer.getByteTimeDomainData(this.data);
    }
    this.fetched = true;
}

Trace.prototype.draw = function (triggerLocation) {
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
