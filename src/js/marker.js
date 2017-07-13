export const draw = function (context, scopeState, markerState, d, length) {
    // Store old state
    context.save();

    // Setup brush
    context.strokeWidth = 1;
    context.strokeStyle = '#006644';
    if (context.setLineDash) {
        context.setLineDash([5]);
    }

    // Draw marker
    if(markerState.type == 'vertical'){
        // TODO: draw a label to better find a marker
        context.beginPath();
        context.moveTo(markerState.x * d * length, 0);
        context.lineTo(markerState.x * d * length, scopeState.height);
        context.stroke();
    } else if(markerState.type == 'horizontal'){
        context.beginPath();
        var halfHeight = scopeState.height / 2;
        context.moveTo(0, halfHeight - markerState.y * d * length);
        context.lineTo(scopeState.width, halfHeight - markerState.y * d * length);
        context.stroke();
    }

    // Restore old brush settings
    context.restore();
};