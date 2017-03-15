import m from 'mithril';
import { jsPlumb } from 'jsplumb';
import { radioSelection } from './components.js';
import { Waveform, Microphone } from '../source.js';

export const sourceNode = {
    view: function(vnode) {
        return m('.card.node.unselectable', {
            id: 'node-' + vnode.attrs.id,
            style: {
                top: vnode.attrs.top + 'px',
                left: vnode.attrs.left + 'px'
            }
        }, [
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
                            switch(vnode.attrs.type){
                            default:
                            case 'Waveform':
                                vnode.attrs.ctrl = new Waveform(vnode.attrs);
                                break;

                            case 'Microphone':
                                vnode.attrs.ctrl = new Microphone(vnode.attrs);
                                break;
                            }
                            m.redraw();
                        }
                    })
                ])
            ]),
            m('.card-body', (vnode.attrs.type == 'Waveform' ? m(sineBody, vnode.attrs) : 'Not implemented'))
        ]);
    },
    oncreate: function(vnode) {
        jsPlumb.bind('ready', function(){
            jsPlumb.draggable(vnode.dom.id, {
                grid:[50,50],
                stop: function(e){
                    vnode.attrs.top = e.pos[1];
                    vnode.attrs.left = e.pos[0];
                }
            });

            jsPlumb.addEndpoint(vnode.dom.id, { 
                anchor: ['Right', {shape: 'Rectangle'}],
                isSource: true,
            });
        })

        switch(vnode.attrs.type){
        default:
        case 'Waveform':
            vnode.attrs.ctrl = new Waveform(vnode.attrs);
            break;

        case 'Microphone':
            vnode.attrs.ctrl = new Microphone(vnode.attrs);
            break;
        }
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