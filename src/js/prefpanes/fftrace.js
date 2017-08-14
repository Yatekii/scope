import m from 'mithril';
import { windowFunctions } from '../math/windowing.js';
import { withKey, capitalizeFirstLetter } from '../helpers.js';
import {
    hertzToString,
    voltsToString,
    wattsToString,
    wattsPerHertzToString,
    percentageToSample,
    sampleToFrequency,
    sampleToPercentage,
    frequencyToSample
} from '../math/converting.js';

export const FFTracePrefPane = {
    view: function(vnode){
        var t = vnode.attrs.traceConf;
        if(!t._info){
            t._info = {};
        }
        var s = vnode.attrs.scopeConf;
        if(s.source._ctrl && !s.source._ctrl.ready){
            return m('.form-horizontal', 'Source is not ready.');
        }
        return [
            m('.form-horizontal', [
                // GUI: Change color and name
                m('.form-group',[
                    m('.col-2.text-center', m('input[type=color]', {
                        value: t.color,
                        onchange: m.withAttr('value', function(v){ t.color = v; })
                    })),
                    m('h4.col-4', !vnode.state.editName ?
                        m('', { onclick: function(){ vnode.state.editName = true; } }, t.name) :
                        m('input.form-input[type=text]', {
                            value: t.name,
                            onchange: m.withAttr('value', function(v){ t.name = v; }),
                            onblur: function(){ vnode.state.editName = false; },
                            onkeypress: withKey(13, function(){
                                vnode.state.editName = false;
                            })
                        })
                    ),
                    m('.col-2', m('label.form-switch', [
                        m('input[type="checkbox"][' + (t.active ? 'checked' : '') + ']', {
                            onchange: function(){
                                t.active = !t.active;
                            }
                        }),
                        m('i.form-icon'),
                    ])),
                    m('button.btn.col-4', {
                        onclick: function(){
                            vnode.state.exportActive = !vnode.state.exportActive;
                            vnode.state.exportData = '[' + t._ctrl._data.join(', ') + ']';
                        }
                    }, 'Export Data')
                ]),
            t.active ? [
                // GUI: Display Export Data
                m('.modal' + (vnode.state.exportActive ? 'active' : ''), [
                    m('.modal-overlay'),
                    m('.modal-container', [
                        m('.modal-header', [
                            m('button.btn.btn-clear.float-right', {
                                onclick: function(){
                                    vnode.state.exportActive = !vnode.state.exportActive;
                                }
                            }),
                            m('.modal-title', 'Frequency Data')
                        ]),
                        m('.modal-body', 
                            m('.content', m('textarea[style=height:200px;width:100%]', 
                                vnode.state.exportData
                            ))
                        )
                    ])
                ]),
                // GUI: Display Δf, ΔA, RMS Signal Power, Signal Power Density
                m('.form-group', [
                    m('.col-2', m('label.form-label', 'Δf:')),
                    m('.col-4', m('label.form-label', hertzToString(t._info.deltaf))),
                    m('.col-2', m('label.form-label', 'ΔA:')),
                    m('.col-4', m('label.form-label', voltsToString(t._info.deltaA)))
                ]),
                m('.form-group', [
                    m('.col-2', m('label.form-label', ['P:', m('sub', 'rms')])),
                    m('.col-4', m('label.form-label', wattsToString(t._info.RMSPower))),
                    m('.col-2', m('label.form-label', '\u2202P/\u2202f:')),
                    m('.col-4', m('label.form-label', wattsPerHertzToString(t._info.powerDensity)))
                ]),
                m('.form-group', [
                    m('.col-2', m('label.form-label', ['ΔP:', m('sub', 'rms')])),
                    m('.col-4', m('label.form-label', wattsToString(t._info.DeltaRMSPower)))
                ]),
                // GUI: Select windowing
                m('.form-group', [
                    m('.col-3', m('label.form-label [for=window', 'Window')),
                    m('.col-9', m('select.form-input', {
                        id: 'window',
                        value: t.windowFunction,
                        onchange: m.withAttr('value', function(value) {
                            t.windowFunction = value;
                        }),
                    }, Object.keys(windowFunctions).map(function(value){
                        return m('option', { value: value }, capitalizeFirstLetter(value));
                    }))
                    )
                ]),
                // GUI: Display SNR
                m('.form-group', [
                    m('.col-6', m('label.form-switch', [
                        m('input[type="checkbox"][' + (t.calculateSNR ? 'checked' : '') + ']', {
                            onchange: function(){
                                t.calculateSNR = !t.calculateSNR;
                            }
                        }),
                        m('i.form-icon'),
                        'Calculate SNR:'
                    ])),
                    m('.col-6', m('label.form-label', { id: 'SNR' }, t._info.SNR))
                ]),
                // GUI: Select display mode
                (t.calculateSNR ? [
                    m('.form-group', [
                        m('.col-12', m('.btn-group.btn-group-block', [
                            m('button.btn' + (t.SNRmode == 'manual' ? '.active' : ''), {
                                onclick: function(){
                                    t.SNRmode = 'manual';
                                }
                            }, 'Manual'),
                            m('button.btn' + (t.SNRmode == 'auto' ? '.active' : ''), {
                                onclick: function(){
                                    t.SNRmode = 'auto';
                                }
                            }, 'Auto')
                        ]))
                    ]),
                    // GUI: Settings for the SNR markers
                    m('.form-group', [
                        m('.col-3', m('label.form-label', 'Lower Marker')),
                        m('.col-8', m('input.form-input', {
                            disabled: t.SNRmode == 'auto',
                            type: 'number',
                            value: Math.floor(sampleToFrequency(
                                percentageToSample(
                                    t.markers.find(function(m){ return m.id == 'SNRfirst'; }).x,
                                    s.source.frameSize
                                ),
                                s.source.samplingRate / 2,
                                s.source.frameSize
                            )),
                            onchange: m.withAttr('value', function(value) {
                                var marker = t.markers.find(function(m){ return m.id == 'SNRfirst'; });
                                marker.x = sampleToPercentage(
                                    frequencyToSample(
                                        parseInt(value),
                                        s.source.samplingRate / 2,
                                        s.source.frameSize
                                    ),
                                    s.source.frameSize
                                );
                            }),
                        })),
                        m('.col-1', m('label.form-label', 'Hz'))
                    ]),
                    m('.form-group', [
                        m('.col-3', m('label.form-label', 'Upper Marker')),
                        m('.col-8', m('input.form-input', {
                            disabled: t.SNRmode == 'auto',
                            type: 'number',
                            value: Math.floor(sampleToFrequency(
                                percentageToSample(
                                    t.markers.find(function(m){ return m.id == 'SNRsecond'; }).x,
                                    s.source.frameSize
                                ),
                                s.source.samplingRate / 2,
                                s.source.frameSize
                            )),
                            onchange: m.withAttr('value', function(value) {
                                var marker = t.markers.find(function(m){ return m.id == 'SNRsecond'; });
                                marker.x = sampleToPercentage(
                                    frequencyToSample(
                                        parseInt(value),
                                        s.source.samplingRate / 2,
                                        s.source.frameSize
                                    ),
                                    s.source.frameSize
                                );
                            }),
                        })),
                        m('.col-1', m('label.form-label', 'Hz'))
                    ])
                ] : '')
            ] : []
            ])
        ];
    }
};