export const draw = function (context, scope, state) {
    // Store old state
    context.save();

    // Setup brush
    context.fillStyle = '#FFFFFF';

    // Draw Box
    context.fillRect(state.left, state.top, state.width, state.height);

    // Restore old brush settings
    context.restore();
};