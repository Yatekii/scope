/* 
 * File to hold the preferences GUI for timetraces.
 */

import m from 'mithril';
import { withKey } from '../helpers.js';
import { secondsToString, voltsToString } from '../math/converting.js';

export const TimeTracePrefPane = {
    view: function(vnode){
        var t = vnode.attrs.traceConf;
        if(!t._info){
            t._info = {};
        }
        var s = vnode.attrs.scopeConf;
        if(s.source._ctrl && !s.source._ctrl.ready){
            return m('.form-horizontal', 'Source is not ready.');
        }
        return [
            m('header.columns', ''),
            m('.form-horizontal', [
                // GUI: Change color and name and active/export toggle
                m('.form-group',[
                    m('.col-2.text-center', m('input[type=color]', {
                        value: t.color,
                        onchange: m.withAttr('value', function(v){ t.color = v; })
                    })),
                    m('h4.col-4', !vnode.state.editName ?
                        m('', { onclick: function(){ vnode.state.editName = true; } }, t.name) :
                        m('input.form-input[type=text]', {
                            value: t.name,
                            onchange: m.withAttr('value', function(v){ t.name = v; }),
                            onblur: function(){ vnode.state.editName = false; },
                            onkeypress: withKey(13, function(){
                                vnode.state.editName = false;
                            })
                        })
                    ),
                    m('.col-2', m('label.form-switch', [
                        m('input[type="checkbox"][' + (t.active ? 'checked' : '') + ']', {
                            onchange: function(){
                                t.active = !t.active;
                                if(!t.active && s.source.activeTrace == t._ctrl.id){
                                    console.log(s.source.traces.filter(function(obj) {
                                        return obj.active;
                                    }));
                                    s.source.activeTrace = s.source.traces.filter(function(obj) {
                                        return obj.active;
                                    })[0]._ctrl.id;
                                }
                            }
                        }),
                        m('i.form-icon'),
                    ])),
                    m('button.btn.col-4', {
                        onclick: function(){
                            vnode.state.exportActive = !vnode.state.exportActive;
                            vnode.state.exportData = '[' + t._ctrl._data.join(', ') + ']';
                        }
                    }, 'Export Data')
                ]),
                t.active ? [
                    // GUI: Display Export Data
                    m('.modal' + (vnode.state.exportActive ? 'active' : ''), [
                        m('.modal-overlay'),
                        m('.modal-container', [
                            m('.modal-header', [
                                m('button.btn.btn-clear.float-right', {
                                    onclick: function(){
                                        vnode.state.exportActive = !vnode.state.exportActive;
                                    }
                                }),
                                m('.modal-title', 'Time Data')
                            ]),
                            m('.modal-body', 
                                m('.content', m('textarea[style=height:200px;width:100%]', 
                                    vnode.state.exportData
                                ))
                            )
                        ])
                    ]),
                    // GUI: Display Δt, ΔA
                    m('.form-group', [
                        m('.col-1', m('label.form-label', 'Δt:')),
                        m('.col-5', m('label.form-label', secondsToString(t._info.deltat))),
                        m('.col-1', m('label.form-label', 'ΔA:')),
                        m('.col-5', m('label.form-label', voltsToString(t._info.deltaA)))
                    ]), s.source.triggerTrace == t._ctrl.id ? [
                        m('.form-group', [
                            m('.col-3', m('label.form-label', 'Trigger Level')),
                            m('.col-8', m('input.form-input', {
                                type: 'number',
                                step: '0.01',
                                value: s.source.trigger.level,
                                oninput: m.withAttr('value', function(value) {
                                    s.source.trigger.level = parseFloat(value);
                                    s.source._ctrl.forceTrigger();
                                }),
                            })),
                            m('.col-1', m('label.form-label', 'V'))
                        ])
                    ] : [],
                ] : []
            ])
        ];
    }
};