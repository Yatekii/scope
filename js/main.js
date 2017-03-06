function init() {
    osc1=createSource({type: 'sine', data: { freq: 220}});
    osc2=createSource({type: 'sine', data: { freq: 440}});
    audioContext = getAudioContext();
    osc1.output.connect(audioContext.destination);
    osc2.output.connect(audioContext.destination);
    scope = new Oscilloscope(null, '100%', '256px', [osc1, osc2]);
    osc1.start(audioContext.currentTime+0.05);
    osc2.start(audioContext.currentTime+0.05);
    setupCanvases();
    draw(scope);
}

window.addEventListener("load", init);