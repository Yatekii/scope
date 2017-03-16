export const draw = function (context, scope, state) {
    // Store old state
    context.save();

    // Setup brush
    context.strokeWidth = 1;
    context.strokeStyle = '#006644';
    if (context.setLineDash) {
        context.setLineDash([5]);
    }

    // Draw marker
    if(state.type == 'vertical'){
        context.beginPath();
        context.moveTo(state.x * scope.width, 0);
        context.lineTo(state.x * scope.width, scope.height);
        context.stroke();
    } else if(state.type == 'horizontal'){
        context.beginPath();
        var halfHeight = scope.height / 2;
        context.moveTo(0, halfHeight - state.y * halfHeight);
        context.lineTo(scope.width, halfHeight - state.y * halfHeight);
        context.stroke();
    }

    // Restore old brush settings
    context.restore();
};

