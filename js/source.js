var generatorRepresentation = `<li class="mdl-list__item source">
    <span class="mdl-list__item-primary-content">
      <i class="material-icons  mdl-list__item-avatar">person</i>
      <span class="card-title">Waveform</span>
    </span>
    <span class="mdl-list__item-secondary-action">
      <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="list-switch-1">
        <input type="checkbox" id="list-switch-1" class="mdl-switch__input source-on-off"/>
      </label>
    </span>
  </li>`;

var microphoneRepresentation = `<li class="mdl-list__item source">
    <span class="mdl-list__item-primary-content">
      <i class="material-icons  mdl-list__item-avatar">person</i>
      <span class="card-title">Microphone</span>
    </span>
    <span class="mdl-list__item-secondary-action">
      <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="list-switch-1">
        <input type="checkbox" id="list-switch-1" class="mdl-switch__input source-on-off"/>
      </label>
    </span>
  </li>`;


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

function Generator(container, scope, source, isSpawn) {
    this.scope = scope;
    this.source = source;
    
    element = htmlToElement(generatorRepresentation);
    if(container) {
      container.appendChild(element);
    } else {
      document.body.appendChild(element);
    }
    this.on = element.getElementsByClassName('source-on-off');
    element.controller = this;
}

function Microphone(container, scope, source, isSpawn) {
    this.scope = scope;
    this.source = source;
    this.isSpawn = isSpawn;
    element = htmlToElement(microphoneRepresentation);
    if(container) {
      container.appendChild(element);
    } else {
      document.body.appendChild(element);
    }
    element.controller = this;
}