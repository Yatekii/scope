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

function triggerLevelChange(scope) {
  scope.triggerLevel = parseInt(document.getElementById('trigger-level').value);
}