import m from 'mithril';
import { windowFunctions } from '../math/windowing.js';
import { withKey, capitalizeFirstLetter } from '../helpers.js';

export const FFTracePrefPane = {
    view: function(vnode){
        var s = vnode.attrs.traceConf;
        return [
            m('header.columns', ''),
            m('.form-horizontal', [
                m('.form-group',[
                    m('.col-3.text-center', m('input[type=color]', {
                        value: s.color,
                        onchange: m.withAttr('value', function(v){ s.color = v; })
                    })),
                    m('h4.col-9', !vnode.state.editName ?
                        m('', { onclick: function(){ vnode.state.editName = true; } }, s.node.name) :
                        m('input.form-input[type=text]', {
                            value: s.node.name,
                            onchange: m.withAttr('value', function(v){ s.node.name = v; }),
                            onblur: function(){ vnode.state.editName = false; },
                            onkeypress: withKey(13, function(target){
                                vnode.state.editName = false;
                            })
                        })
                    )
                ]),
                m('.form-group', [
                    m('.col-3', m('label.form-label [for=signalfrequency]', 'Signal Frequency')),
                    m('.col-9', m('input.form-input', {
                        type: 'number',
                        id: 'signalfrequency', 
                        value: s.signalFrequency,
                        onchange: m.withAttr('value', function(value) {
                            s.signalFrequency = parseInt(value);
                        }),
                    }))
                ]),
                m('.form-group', [
                    m('.col-3', m('label.form-label [for=window', 'Window')),
                    m('.col-9', m('select.form-input', {
                        id: 'window',
                        value: s.windowFunction,
                        onchange: m.withAttr('value', function(value) {
                            s.windowFunction = value;
                        }),
                    }, Object.keys(windowFunctions).map(function(value){
                        return m('option', { value: value }, capitalizeFirstLetter(value));
                    }))
                    )
                ]),
                m('.form-group', [
                    m('.col-12', m('.btn-group.btn-group-block', [
                        m('button.btn' + (s.SNRmode == 'manual' ? '.active' : ''), {
                            onclick: function(e){
                                s.SNRmode = 'manual';
                            }
                        }, 'Manual'),
                        m('button.btn' + (s.SNRmode == 'auto' ? '.active' : ''), {
                            onclick: function(e){
                                s.SNRmode = 'auto';
                            }
                        }, 'Auto')
                    ]))
                ]),
                m('.form-group', [
                    m('.col-3', m('label.form-label [for=SNR', 'SNR')),
                    m('.col-9', m('label.form-label', { id: 'SNR' }, s.info.SNR))
                ])
            ])
        ];
    }
}