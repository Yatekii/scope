import m from 'mithril';
import { windowFunctions } from '../math/windowing.js';
import { withKey, capitalizeFirstLetter } from '../helpers.js';
import { hertzToString } from '../math/converting.js';

export const FFTracePrefPane = {
    view: function(vnode){
        var t = vnode.attrs.traceConf;
        var s = vnode.attrs.scopeConf;
        return [
            m('header.columns', ''),
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
                            value: t.node.name,
                            onchange: m.withAttr('value', function(v){ t.name = v; }),
                            onblur: function(){ vnode.state.editName = false; },
                            onkeypress: withKey(13, function(target){
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
                            onclick: function(e){
                                t.SNRmode = 'manual';
                            }
                        }, 'Manual'),
                        m('button.btn' + (t.SNRmode == 'auto' ? '.active' : ''), {
                            onclick: function(e){
                                t.SNRmode = 'auto';
                            }
                        }, 'Auto')
                    ]))
                ]),
                // GUI: Settings for the SNR markers
                m('.form-group', [
                    m('.col-3', m('label.form-label', 'Lower Marker')),
                    m('.col-9', m('input.form-input', {
                        type: 'number',
                        value: s.markers.find(function(m){ return m.id == 'SNRfirst'; }).x,
                        onchange: m.withAttr('value', function(value) {
                            s.markers.find(function(m){ return m.id == 'SNRfirst'; }).x = parseInt(value);
                        }),
                    }))
                ]),
                m('.form-group', [
                    m('.col-3', m('label.form-label', 'Upper Marker')),
                    m('.col-9', m('input.form-input', {
                        type: 'number',
                        value: s.markers.find(function(m){ return m.id == 'SNRsecond'; }).x,
                        onchange: m.withAttr('value', function(value) {
                            s.markers.find(function(m){ return m.id == 'SNRsecond'; }).x = parseInt(value);
                        }),
                    }))
                ])
            ])
        ];
    }
}