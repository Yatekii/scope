/*
 * This file holds the general settings GUI.
 */

import m from 'mithril';

export const generalPrefPane = {
    view: function(vnode){
        var s = vnode.attrs.scopeConf;
        return [
            m('header.text-center', m('h4', s)),
            m('.form-horizontal', [
                // GUI: Select mode
                m('.form-group', [
                    m('.col-12', m('.btn-group.btn-group-block', [
                        m('button.btn' + (s.mode == 'normal' ? '.active' : ''), {
                            onclick: function(){
                                s.source.ctrl.normal();
                                s.mode = 'normal';
                            }
                        }, 'Normal'),
                        m('button.btn' + (s.mode == 'auto' ? '.active' : ''), {
                            onclick: function(){
                                s.source.ctrl.single();
                                s.mode = 'auto';
                            }
                        }, 'Auto'),
                        m('button.btn' + (s.mode == 'single' ? '.active' : ''), {
                            onclick: function(){
                                s.source.ctrl.single();
                                s.mode = 'single';
                            }
                        }, 'Single')
                    ]))
                ]),
                // GUI: Single Shot and Force Trigger
                m('.form-group', [
                    m('button.btn.col-6', {
                        onclick: function(){
                            s.source.ctrl.single();
                            s.mode = 'single';
                        }
                    }, 'Single Shot'),
                    m('button.btn.col-6', {
                        onclick: function(){
                            s.source.ctrl.forceTrigger();
                        }
                    }, 'Force Trigger')
                ]),
                // GUI: Display and select all traces
                m('.form-group', [
                    m('.col-12', m('.btn-group.btn-group-block',
                        s.source.traces.map(function(trace){
                            return m('button.btn' + (trace.ctrl && s.source.activeTrace == trace.ctrl.id ? '.active' : ''), {
                                style: { backgroundColor: trace.color },
                                onclick: function(){
                                    s.source.activeTrace = trace.ctrl.id;
                                }
                            }, trace.name);
                        })
                    ))
                ]),
            ])
        ];
    }
};