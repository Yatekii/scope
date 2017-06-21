/* 
 * File to hold the preferences GUI for timetraces.
 */

import m from 'mithril';
import { withKey } from '../helpers.js';
import { secondsToString } from '../math/converting.js';

export const TimeTracePrefPane = {
    view: function(vnode){
        var t = vnode.attrs.traceConf;
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
                            value: t.name,
                            onchange: m.withAttr('value', function(v){ t.name = v; }),
                            onblur: function(){ vnode.state.editName = false; },
                            onkeypress: withKey(13, function(){
                                vnode.state.editName = false;
                            })
                        })
                    )
                ]),
                // GUI: Display Δt
                m('.form-group', [
                    m('.col-3', m('label.form-label', 'Δt')),
                    m('.col-9', m('label.form-label', secondsToString(t.info.deltat)))
                ]),
                // GUI: Display ΔA
                m('.form-group', [
                    m('.col-3', m('label.form-label', 'ΔA')),
                    m('.col-9', m('label.form-label', t.info.deltaA))
                ]),
            ])
        ];
    }
};