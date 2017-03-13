import m from 'mithril';
import { radioSelection } from './components.js';

export const sourceNode = {
    oninit: function(vnode) {
        if(vnode.attrs.ctrl){
            this.ctrl = vnode.attrs.ctrl;
        } else {
            this.ctrl = {};
        }
    },
    view: (vnode) =>
        m('.card', [
            m('.card-header', [
                m('.card-title', 'Source'),
                m('.card-meta', [
                    m(radioSelection, {
                        id: 'test-source',
                        items: ['Waveform', 'Microphone'],
                        startValue: 'Waveform',
                        onchange: (value) => {
                            vnode.state.ctrl.type = value;
                            m.redraw();
                        }
                    })
                ])
            ]),
            m('.card-body', (vnode.state.ctrl.type == 'Waveform' ? m(sineBody, { ctrl: vnode.state.ctrl }) : 'YOLO2'))
        ])
};

const sineBody = {
    oninit: function(vnode) {
        if(vnode.attrs.amplitude){
            this.amplitude = vnode.attrs.amplitude;
        } else {
            this.amplitude = 0.5;
        }
        if(vnode.attrs.frequency){
            this.frequency = vnode.attrs.frequency;
        } else {
            this.frequency = 1337;
        }
    },
    view: (vnode) => [
        m('.form-group', [
            m('label.form-label [for=sine-amplitude-' + vnode.attrs.id + ']', 'Amplitude'),
            m('input.form-input', {
                type: 'number',
                id: 'sine-amplitude-' + vnode.attrs.id,
                value: vnode.state.amplitude,
                onchange: m.withAttr('value', function(value) {
                    vnode.state.amplitude = value;
                }),
            })
        ]),
        m('.form-group', [
            m('label.form-label [for=sine-frequency-' + vnode.attrs.id + ']', 'Frequency'),
            m('input.form-input', {
                type: 'number',
                id: 'sine-frequency-' + vnode.attrs.id, 
                value: vnode.state.frequency,
                onchange: m.withAttr('value', function(value) {
                    vnode.state.frequency = value;
                }),
            })
        ])
    ]
};