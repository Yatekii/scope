var generatorRepresentation = '<div class="card blue-grey darken-1 col s3 source">\
    <div class="card-content white-text">\
        <span class="card-title">Waveform</span>\
        <p></p>\
    </div>\
    <div class="card-action">\
        <div class="switch">\
        <label>\
            Off\
            <input type="checkbox">\
            <span class="lever"></span>\
            On\
        </label>\
        </div>\
    </div>\
</div>';

var microphoneRepresentation = '<div class="card blue-grey darken-1 col s3 source">\
    <div class="card-content white-text">\
        <span class="card-title">Microphone</span>\
        <p></p>\
    </div>\
    <div class="card-action">\
        <div class="switch">\
        <label>\
            Off\
            <input type="checkbox">\
            <span class="lever"></span>\
            On\
        </label>\
        </div>\
    </div>\
</div>';

function htmlToElement(html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
}

function Generator(container, scope, source, isSpawn) {
    this.scope = scope;
    this.source = source;
    this.isSpawn = isSpawn;
    element = htmlToElement(generatorRepresentation);
    if(container) {
      container.appendChild(element);
    } else {
      document.body.appendChild(element);
    }
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