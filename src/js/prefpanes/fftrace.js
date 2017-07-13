import m from 'mithril';
import { windowFunctions } from '../math/windowing.js';
import { withKey, capitalizeFirstLetter } from '../helpers.js';
import {
    hertzToString,
    percentageToSample,
    sampleToFrequency,
    sampleToPercentage,
    frequencyToSample
} from '../math/converting.js';

export const FFTracePrefPane = {
    view: function(vnode){
        var t = vnode.attrs.traceConf;
        var s = vnode.attrs.scopeConf;
        return [
            m('.form-horizontal', [
                // GUI: Change color and name
                m('.form-group',[
                    m('.col-3.text-center', m('input[type=color]', {
                        value: t.color,
                        onchange: m.withAttr('value', function(v){ t.color = v; })
                    })),
                    m('h4.col-9', !vnode.state.editName ?
                        m('', { onclick: function(){ vnode.state.editName = true; } }, t.name) :
                        m('input.form-input[type=text]', {
                            value: t.name,
                            onchange: m.withAttr('value', function(v){ t.name = v; }),
                            onblur: function(){ vnode.state.editName = false; },
                            onkeypress: withKey(13, function(){
                                vnode.state.editName = false;
                            })
                        })
                    )
                ]),
                // GUI: Display Δf
                m('.form-group', [
                    m('.col-3', m('label.form-label', 'Δf')),
                    m('.col-9', m('label.form-label', hertzToString(t.info.deltaf)))
                ]),
                // GUI: Display ΔA
                m('.form-group', [
                    m('.col-3', m('label.form-label', 'ΔA')),
                    m('.col-9', m('label.form-label', t.info.deltaA))
                ]),
                // GUI: Display RMS Signal Power
                m('.form-group', [
                    m('.col-3', m('label.form-label', ['P', m('sub', 'rms')])),
                    m('.col-9', m('label.form-label', t.info.RMSPower + ' W'))
                ]),
                // GUI: Display Signal Power Density
                m('.form-group', [
                    m('.col-3', m('label.form-label', ['dP/df', ])),
                    m('.col-9', m('label.form-label', t.info.powerDensity + ' W/Hz'))
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
                    m('.col-3', m('label.form-label [for=SNR', 'SNR')),
                    m('.col-9', m('label.form-label', { id: 'SNR' }, t.info.SNR))
                ]),
                // GUI: Select display mode
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
            ])
        ];
    }
};