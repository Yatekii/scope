import * as converting from './math/converting.js';

export const draw = function (context, scopeState, markerState, traceState, d, length) {
    // Store old state
    context.save();

    // Setup brush
    context.strokeWidth = 1;
    context.strokeStyle = markerState.color;
    if (markerState.dashed && context.setLineDash) {
        context.setLineDash([5]);
    }

    // Draw marker
    if(markerState.type == 'vertical'){
        context.beginPath();
        context.moveTo(markerState.x * d * length, 0);
        if(!markerState.active){
            // If the marker is not active, just draw it
            context.lineTo(markerState.x * d * length, scopeState.height);
            context.stroke();
        } else {
            // If the marker is active, draw additional info
            context.font = '14px Arial';
            console.log(traceState.source)
            // Calculate frequency at marker and convert it to string
            const text = Math.round(converting.sampleToFrequency(
                converting.percentageToSample(markerState.x, length),
                scopeState.source.samplingRate / (traceState.halfSpectrum ? 2 : 1),
                length
            )).toString();
            const width = context.measureText(text).width;
            const height = 14;
            // Draw the line for the marker with a gap
            context.lineTo(markerState.x * d * length, scopeState.height - (height + 10 + 6 * 2));
            context.moveTo(markerState.x * d * length, scopeState.height - 10);
            context.lineTo(markerState.x * d * length, scopeState.height);
            context.save();
            context.fillStyle = '#FFFFFF';
            // Calculate size of the rectangle around the text left and right from the marker
            // (if it is at the border of the screen it's not half/half)
            const leftFree = Math.min(markerState.x * d * length, (width / 2 + 6));
            const rightFree = Math.min(markerState.x * d * length, scopeState.width - (width / 2 + 6));
            // Fill the rectangle background with white so text will be readable
            context.fillRect(
                rightFree - leftFree,
                scopeState.height - (height + 10 + 6 * 2),
                width + 2 * 6,
                height + 2 * 6
            );
            context.stroke();
            // Draw the border of the rectangle
            context.rect(
                rightFree - leftFree,
                scopeState.height - (height + 10 + 6 * 2),
                width + 2 * 6,
                height + 2 * 6
            );
            context.stroke();
            context.restore();
            // Draw the text
            context.fillText(
                text,
                rightFree - (leftFree - 6),
                scopeState.height - (10 + 6)
            );
        }
    } else if(markerState.type == 'horizontal'){
        // This case is never really used thus far and can be extended later on when needed
        context.beginPath();
        var halfHeight = scopeState.height / 2;
        context.moveTo(0, halfHeight - markerState.y * d * length);
        context.lineTo(scopeState.width, halfHeight - markerState.y * d * length);
        context.stroke();
    }

    // Restore old brush settings
    context.restore();
};