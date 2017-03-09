function Waveform(container, scope, source, isSpawn) {
    var me = this;

    // Assign class variables
    this.scope = scope;
    this.source = source;

    // Create HTML representation
    var tr = this.createTraceRepr('source-title-' + scope.sources.length, 'source-switch-' + scope.sources.length)
    this.repr = initRepr(tr, document.getElementById('sources-available'));
    componentHandler.upgradeElement(this.repr);
    this.repr.controller = this;

    // Find on-off switch
    var on_off = this.repr.getElementsByClassName('trace-on-off')[0];
    on_off.onchange = function(event) { me.onSwitch(me, event); };
    on_off.checked = true;
    componentHandler.upgradeElement(on_off.parentElement);

    // Find repr title
    var title = document.getElementsByClassName('card-title')[0];
    componentHandler.upgradeElement(title.parentElement);
}

Waveform.prototype.createTraceRepr = function(title_id, switch_id) {
    return `<li class="mdl-list__item source">
        <div class="mdl-card mdl-shadow--2dp trace-card">
            <div class="mdl-card__title">
                <i class="material-icons trace-card-icon">keyboard_capslock</i>&nbsp;
                <div class="mdl-textfield mdl-js-textfield">
                    <input class="mdl-textfield__input card-title" type="text" id="${ title_id }">
                    <label class="mdl-textfield__label" for="${ title_id }">Waveform</label>
                </div>
                <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="${ switch_id }">
                    <input type="checkbox" id="${ switch_id }" class="mdl-switch__input trace-on-off"/>
                </label>
            </div>
        </div>
    </li>`;
}

Waveform.prototype.onSwitch = function(source, event) {
    console.log('Switch stub.')
    // source.on = event.target.checked;
}

function Microphone(container, scope, source, isSpawn) {
    this.scope = scope;
    this.source = source;
    this.isSpawn = isSpawn;

    // Create HTML representation
    var tr = this.createTraceRepr('source-title-' + scope.sources.length, 'source-switch-' + scope.sources.length)
    var repr = initRepr(tr, document.getElementById('sources-available'));
    componentHandler.upgradeElement(repr);
    this.repr = repr;
    repr.controller = this;

     // Find on-off switch
    var on_off = this.repr.getElementsByClassName('trace-on-off')[0];
    on_off.onchange = function(event) { me.onSwitch(me, event); };
    on_off.checked = true;
    componentHandler.upgradeElement(on_off.parentElement);

    // Find repr title
    var title = document.getElementsByClassName('card-title')[0];
    componentHandler.upgradeElement(title.parentElement);
}

Microphone.prototype.createTraceRepr = function(title_id, switch_id) {
    return `<li class="mdl-list__item source">
        <div class="mdl-card mdl-shadow--2dp trace-card">
            <div class="mdl-card__title">
                <i class="material-icons trace-card-icon">keyboard_tab</i>&nbsp;
                <div class="mdl-textfield mdl-js-textfield">
                    <input class="mdl-textfield__input card-title" type="text" id="${ title_id }">
                    <label class="mdl-textfield__label" for="${ title_id }">Microphone</label>
                </div>
                <label class="mdl-switch mdl-js-switch mdl-js-ripple-effect" for="${ switch_id }">
                    <input type="checkbox" id="${ switch_id }" class="mdl-switch__input trace-on-off"/>
                </label>
            </div>
        </div>
    </li>`;
}

Microphone.prototype.onSwitch = function(source, event) {
    console.log('Switch stub.')
    // source.on = event.target.checked;
}