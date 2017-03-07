function init() {
    if (!navigator.getUserMedia)
        navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (!navigator.cancelAnimationFrame)
        navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
    if (!navigator.requestAnimationFrame)
        navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

    osc1=createSource({type: 'sine', data: { freq: 220}});
    osc2=createSource({type: 'sine', data: { freq: 440}});
    mic = createSource({type: 'mic'}).mic;
    audioContext = getAudioContext();
    // osc1.output.connect(audioContext.destination);
    // osc2.output.connect(audioContext.destination);
    scope = new Oscilloscope(document.getElementById('scope-container'), '100%', '256px', [osc1, osc2]);
    new Generator(document.getElementById('active-sources'), scope, {}, true);
    new Microphone(document.getElementById('active-sources'), scope, {}, true);
    new Generator(document.getElementById('available-sources'), scope, {}, true);
    new Microphone(document.getElementById('available-sources'), scope, {}, true);

    var sourcesDrake = dragula([document.getElementById('available-sources'), document.getElementById('active-sources')], {
        copy: function (el, source) {
            return source === document.getElementById('available-sources');
        },
        accepts: function (el, target) {
            return target !== document.getElementById('available-sources');
        }
    });

    var draggedOriginal = null
    sourcesDrake.on('cloned', function(clone, original, type) {
        draggedOriginal = original;
    });
    sourcesDrake.on('drop', function(el, target, source, sibling) {
        console.log(draggedOriginal);
        console.log('YEAH!');
    });
    osc1.start(audioContext.currentTime+0.05);
    osc2.start(audioContext.currentTime+0.05);
    draw(scope);
}

window.addEventListener("load", init);