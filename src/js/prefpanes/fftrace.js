import m from 'mithril';
import { windowFunctions } from '../math/windowing.js';
import { capitalizeFirstLetter } from '../helpers.js';

export const FFTracePrefPane = {
    view: function(vnode){
        var s = vnode.attrs.traceConf;
        return [
            m('header.text-center', m('h4', s.node.name)),
            m('.form-horizontal', [
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
                    }, Object.keys(windowFunctions).map(function(value){ return m('option', { value: value }, capitalizeFirstLetter(value)) }))
                    )
                ]),
                m('.form-group', [
                    m('.col-3', m('label.form-label [for=SNR', 'SNR')),
                    m('.col-9', m('label.form-label', { id: 'SNR' }, s.info.SNR))
                ])
            ])
        ];
    }
}