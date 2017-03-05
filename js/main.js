function init() {
    osc=createSource({type: 'sine', data: { freq: 220}});
    audioContext = getAudioContext();
    osc.output.connect(audioContext.destination);
    scope = new Oscilloscope(null, '100%', '256px', osc);
    osc.start(audioContext.currentTime+0.05);
    setupCanvases();
    draw(scope);
}

window.addEventListener("load", init);