function play(state, audiobuffer) {
    // End of stream has been reached
    // if (audiobuffer.length === 0) { return; }

    // Buffering
    if(state.buffering){
        if(audiobuffer.length > state.state.buffer.upperSize){
            state.buffering = false;
        } else {
            setTimeout(function(){
                play(state, audiobuffer);
            }, 45);
            return;
        }
    }
    if(audiobuffer.length < state.state.buffer.lowerSize) {
        state.buffering = true;
        setTimeout(function(){
            play(state, audiobuffer);
        }, 45);
        return;
    }
    var audioContext = helpers.getAudioContext();
    let source = audioContext.createBufferSource();

    //get the latest buffer that should play next
    source.buffer = audiobuffer.shift();

    source.connect(state.output);
    source.connect(audioContext.destination);

    //add this function as a callback to play next buffer
    //when current buffer has reached its end 
    source.onended = function(){ play(state, audiobuffer); };
    source.start();
    console.log(audiobuffer.length);

    // Log # of buffered samples
    // console.log(audiobuffer.length);
}