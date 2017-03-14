export const draw = function (context, scope, state) {
    // Store old state
    context.save();

    // Setup brush
    context.strokeWidth = 1;
    context.strokeStyle = '#006644';
    if (context.setLineDash)
        context.setLineDash([5]);

    // Draw marker
    if(state.type == 'vertical'){
        context.beginPath();
        context.moveTo(state.x, 0);
        context.lineTo(state.x, scope.height);
        context.stroke();
    } else if(state.type == 'horizontal'){
        context.beginPath();
        context.moveTo(0, scope.height / 2 - state.y);
        context.lineTo(scope.width, scope.height / 2 - state.y);
        context.stroke();
    }

    // Restore old brush settings
    context.restore();
};

