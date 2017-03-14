import m from 'mithril';
import { jsPlumb } from 'jsplumb';
import { radioSelection } from './components.js';
import { withKey } from '../helpers.js';

export const traceNode = {
    oninit: function(vnode) {
        vnode.attrs.editingName = false;
    },
    view: function(vnode) {
        return m('.card.node', { id: 'node-' + vnode.attrs.id }, [
            m('.card-header', [
                m('.card-title', [
                    (vnode.attrs.editingName ?
                    m('.form-group', [
                        m('input.form-input', {
                            type: 'text',
                            id: 'trace-name-' + vnode.attrs.id,
                            value: vnode.attrs.name,
                            onkeypress: withKey(13, function(target){
                                console.log(target)
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
            m('.card-body', '')
        ]);
    },
    oncreate: function(vnode) {
        jsPlumb.ready(function(){
            vnode.dom.style.top = (300 + (vnode.attrs.id * 300)) + 'px';
            jsPlumb.draggable(vnode.dom.id, {
                containment:true,
                grid:[50,50]
            });

            jsPlumb.addEndpoint(vnode.dom.id, { 
                anchor: [['Right', {shape: 'Rectangle'}], ['Left', {shape: 'Rectangle'}]],
                isSource: true,
            });
        })
    }
};