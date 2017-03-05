function Oscilloscope(container, width, height, source) {
    // Create analyzer which is needed to properly get data from the source
    this.analyzer = getAudioContext().createAnalyser();
    // Connect the source output to the analyzer
    source.output.connect(this.analyzer);
    // Read first data from the data stream
    this.data = new Uint8Array(this.analyzer.frequencyBinCount);

    // Create a new canvas to draw the scope onto
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = width; 
    this.canvas.style.height = height; 
    this.canvas.id = 'scope';
    // If a parent container was specified use it, otherwise just use the document body
    if(container) {
      container.appendChild(this.canvas);
    } else {
      document.body.appendChild(this.canvas);
    }
    this.triggerLevel = 50;
}

Oscilloscope.prototype.draw = function () {
    // Make life easier with shorter variables
	var data = this.data;
	var width = this.canvas.clientWidth;
	var height = this.canvas.clientHeight;
    this.canvas.height = height;
    this.canvas.width = width;
	var scaling = height / 256;
	var context = this.canvas.getContext('2d');
    context.strokeWidth = 1;
    this.analyzer.fftSize = Math.pow(2, Math.ceil(Math.log2(width)));

    // Get new data
	this.analyzer.getByteTimeDomainData(data);

    // Draw background
	context.fillStyle="#222222";
	context.fillRect(0, 0, width, height);
    context.save();

    // Draw markers
    var quarterHeight = height / 4;
	context.strokeStyle = "#006644";
	context.beginPath();
	if (context.setLineDash)
		context.setLineDash([5]);
	context.moveTo(0, quarterHeight);
	context.lineTo(width, quarterHeight);
	context.stroke();
	context.moveTo(0, quarterHeight * 3);
	context.lineTo(width, quarterHeight * 3);
	context.stroke();

    // Undo dashed stroke
    context.restore();

    // Draw markers
	context.strokeStyle = "#278BFF";
	context.beginPath();
	context.moveTo(0, 128 - this.triggerLevel);
	context.lineTo(width, 128 - this.triggerLevel);
	context.stroke();

    // Draw trace
	context.strokeStyle = "#E8830C";
	context.beginPath();

	var zeroCross = findFirstPositiveZeroCrossing(data, width, this.triggerLevel);
    console.log(zeroCross)

	context.moveTo(0, (256 - data[0]) * scaling);
	for (var i=zeroCross, j=0; (j < width) && (i < data.length); i++, j++){
		context.lineTo(j, (256 - data[i]) * scaling);
    }
	context.stroke();
}

var MINVAL = 234;  // 128 == zero.  MINVAL is the "minimum detected signal" level.

function findFirstPositiveZeroCrossing(buf, buflen, triggerLevel) {
    for(var i=1; i< buflen; i++){
        if(buf[i] > triggerLevel && buf[i - 1] < triggerLevel){
            return i;
        }
    }
}

