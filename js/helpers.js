window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;

function pushme() {
  osc1.stop(0);
  osc2.stop(0);
}

function draw(scope) {  
  if(scope) {
    scope.draw();
  }
  rafID = requestAnimationFrame(function(){draw(scope);});
}

function htmlToElement(html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
}

function initRepr(html, container) {
    element = htmlToElement(html);
    if(container) {
      container.appendChild(element);
    } else {
      document.body.appendChild(element);
    }
    return element;
}

var audioContext = null;
function getAudioContext() {
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	if(audioContext){
		return audioContext;
	}
	audioContext = new AudioContext();
	return audioContext;
}