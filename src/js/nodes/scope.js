import m from 'mithril';
import { jsPlumb } from 'jsplumb';
import { withKey } from '../helpers.js';

export const scopeNode = {
    oninit: function(vnode) {
        vnode.attrs.editingName = false;
    },
    view: function(vnode) {
        return m('.card.node.unselectable', {
            id: 'node-' + vnode.attrs.id,
            style: {
                top: vnode.attrs.top + 'px',
                left: vnode.attrs.left + 'px'
            },
            ondblclick: function() {
                // TODO: Crosswindow stuff
                var popup = window.open(window.location.pathname + '#!/scope?id=' + vnode.attrs.id);
                popup.scopeState = vnode.attrs;
            }
        }, [
            m('.card-header', [
                m('.card-title', [
                    (vnode.attrs.editingName ?
                    m('.form-group', [
                        m('input.form-input', {
                            type: 'text',
                            id: 'scope-name-' + vnode.attrs.id,
                            value: vnode.attrs.name,
                            onkeypress: withKey(13, function(target){
                                vnode.attrs.name = target.value;
                                vnode.attrs.editingName = false;
                            })
                        })
                    ]) :
                    m('span', {
                        onclick: function() {
                            vnode.attrs.editingName = true;
                        }
                    }, vnode.attrs.name))
                    // TODO: Colorlabel here
                ]),
                m('.card-meta', [])
            ]),
            m('.card-body',
                m(body, vnode.attrs)
            )
        ]);
    },
    oncreate: function(vnode) {
        jsPlumb.bind('ready', function(){
            console.log('Handled scope jsPlumb');
            jsPlumb.draggable(vnode.dom.id, {
                grid:[50,50],
                stop: function(e){
                    vnode.attrs.top = e.pos[1];
                    vnode.attrs.left = e.pos[0];
                }
            });

            jsPlumb.addEndpoint(vnode.dom.id, { 
                anchor: ['Left', {shape: 'Rectangle'}],
                isTarget: true,
                maxConnections: 10,
            });
        });
    }
};

const body = {
    view: function(vnode){
        return [
            m('.form-group', [
                m('label.form-label [for=wss-samplingrate-' + vnode.attrs.id + ']', 'Sampling Rate'),
                m('input.form-input', {
                    type: 'number',
                    id: 'wss-samplingrate-' + vnode.attrs.id, 
                    value: vnode.attrs.samplingRate,
                    onchange: m.withAttr('value', function(value) {
                        vnode.attrs.samplingRate = parseInt(value);
                        // TODO: send sampling rate
                    }),
                })
            ])
        ];
    }
};