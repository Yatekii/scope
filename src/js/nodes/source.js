import m from 'mithril';
import { jsPlumb } from 'jsplumb';
import { radioSelection } from './components.js';

export const sourceNode = {
    view: function(vnode) {
        return m('.card.node', { id: 'node-' + vnode.attrs.id }, [
            m('.card-header', [
                m('.card-title', 'Source'),
                m('.card-meta', [
                    m(radioSelection, {
                        id: vnode.attrs.id,
                        items: ['Waveform', 'Microphone'],
                        startValue: 'Waveform',
                        type: vnode.attrs.type,
                        onchange: (value) => {
                            vnode.attrs.type = value;
                            m.redraw();
                        }
                    })
                ])
            ]),
            m('.card-body', (vnode.attrs.type == 'Waveform' ? m(sineBody, vnode.attrs) : 'YOLO2'))
        ]);
    },
    oncreate: function(vnode) {
        vnode.dom.style.top = (300 + (vnode.attrs.id * 300)) + 'px';
        jsPlumb.draggable(vnode.dom.id, {
            containment:true,
            grid:[50,50]
        });

        console.log(vnode.dom.id);
        // jsPlumb.addEndpoint(vnode.dom.id, { 
        //     anchor: ['Right', {shape: 'Rectangle'}],
        //     isSource: true,
        // });
    }
};

const sineBody = {
    view: function(vnode){
        return [
            m('.form-group', [
                m('label.form-label [for=sine-amplitude-' + vnode.attrs.id + ']', 'Amplitude'),
                m('input.form-input', {
                    type: 'number',
                    id: 'sine-amplitude-' + vnode.attrs.id,
                    value: vnode.attrs.amplitude,
                    onchange: m.withAttr('value', function(value) {
                        vnode.attrs.amplitude = value;
                    }),
                })
            ]),
            m('.form-group', [
                m('label.form-label [for=sine-frequency-' + vnode.attrs.id + ']', 'Frequency'),
                m('input.form-input', {
                    type: 'number',
                    id: 'sine-frequency-' + vnode.attrs.id, 
                    value: vnode.attrs.frequency,
                    onchange: m.withAttr('value', function(value) {
                        vnode.attrs.frequency = value;
                    }),
                })
            ])
        ];
    }
};