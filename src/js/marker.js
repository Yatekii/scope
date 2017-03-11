function Marker(scope, type, level) {
    this.scope = scope;
    if(type == 'vertical'){
        this.x = level;
        this.y = null;
    } else {
        this.x = null;
        this.y = level;
    }
}

Marker.prototype.draw = function () {
    // Make life easier with shorter variables
	var context = this.scope.canvas.getContext('2d');
    context.strokeWidth = 1;
	context.strokeStyle = "#006644";
	if (context.setLineDash)
		context.setLineDash([5]);

    if(this.x != null){
        context.beginPath();
        context.moveTo(this.x, 0);
        context.lineTo(this.x, this.scope.canvas.height);
        context.stroke();
    } else if(this.y != null){
        context.beginPath();
        context.moveTo(0, 128 - this.y);
        context.lineTo(this.scope.canvas.width, 128 - this.y);
        context.stroke();
    }
}