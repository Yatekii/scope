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
        const x = Math.ceil((markerState.x - traceState.offset.x) * length * d);
        context.beginPath();
        context.moveTo(x, 0);
        if(!markerState.active){
            // If the marker is not active, just draw it
            context.lineTo(x, scopeState.height);
            context.stroke();
        } else {
            // If the marker is active, draw additional info
            context.font = '14px Arial';
            // Calculate frequency at marker and convert it to string
            const text = converting.hertzToString(Math.floor(converting.sampleToFrequency(
                converting.percentageToSample(markerState.x, length),
                scopeState.source.samplingRate / (traceState.halfSpectrum ? 2 : 1),
                length
            )));
            var width = context.measureText(text).width;
            const height = 14;
            // Draw the line for the marker with a gap
            context.lineTo(x, height + 10 + 6);
            context.moveTo(x, + height + 10 + 6 + height + 2 * 6);
            context.lineTo(x, scopeState.height - (height + 10 + 6 * 2));
            context.moveTo(x, scopeState.height - 10);
            context.lineTo(x, scopeState.height);
            context.save();
            context.fillStyle = '#FFFFFF';
            // Calculate size of the rectangle around the text left and right from the marker
            // (if it is at the border of the screen it's not half/half)
            var leftFree = Math.min(x, (width / 2 + 6));
            var rightFree = Math.min(x, scopeState.width - (width / 2 + 6));
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
            context.fillStyle = markerState.color;
            context.fillText(
                text,
                rightFree - (leftFree - 6),
                scopeState.height - (10 + 6)
            );

            context.font = '14px Arial';
            width = context.measureText(markerState.id).width;
            context.fillStyle = '#FFFFFF';
            // Calculate size of the rectangle around the text left and right from the marker
            // (if it is at the border of the screen it's not half/half)
            leftFree = Math.min(x, (width / 2 + 6));
            rightFree = Math.min(x, scopeState.width - (width / 2 + 6));
            // Fill the rectangle background with white so text will be readable
            context.fillRect(
                rightFree - leftFree,
                (height + 10 + 6),
                width + 2 * 6,
                height + 2 * 6
            );
            context.stroke();
            // Draw the border of the rectangle
            context.rect(
                rightFree - leftFree,
                (height + 10 + 6),
                width + 2 * 6,
                height + 2 * 6
            );
            context.stroke();
            context.restore();
            // Draw the text
            context.fillStyle = markerState.color;
            context.font = '14px Arial';
            context.fillText(
                markerState.id,
                rightFree - (leftFree - 6),
                height  + (10 + 6) * 2
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