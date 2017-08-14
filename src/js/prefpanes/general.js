/*
 * This file holds the general settings GUI.
 */

import m from 'mithril';

export const generalPrefPane = {
    view: function(vnode){
        var s = vnode.attrs.scopeConf;
        var activeTrace = s.source.traces[s.source.activeTrace];
        var samplingRates = [
            25000000,
            5000000,
            1000000,
            200000,
            100000,
            50000
        ];
        return [
            m('header.text-center', m('h4', s)),
            m('.form-horizontal', [
                // GUI: Select sampling rate
                m('.form-group', [
                    m('.col-3', m('label.form-label', 'Sampling Rate')),
                    m('select.form-select.col-9', {
                        value: s.source.samplingRate,
                        onchange: m.withAttr('value', function(v){
                            s.source.samplingRate = parseInt(v);
                            s.source._ctrl.samplingRate(s.source.samplingRate);
                        })
                    }, samplingRates.map(function(t){
                        return m('option', { value: t }, t);
                    }))
                ]),
                m('.form-group', [
                    m('button.btn.col-12', {
                        onclick: function(){
                            // A replacer function which makes the JSON.stringify ignore
                            // variables that start with _ 
                            function replacer(key, value) {
                                if(key.startsWith('_')) return undefined;
                                return value;
                            }
                            vnode.state.exportActive = !vnode.state.exportActive;
                            vnode.state.exportData = JSON.stringify(s, replacer, 4);
                        }
                    }, 'Export Socpe Configuration'),
                    // GUI: Display Export State Tree
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
                    ])
                ]),
                // GUI: Select mode
                m('.form-group', [
                    m('.col-12', m('.btn-group.btn-group-block', [
                        m('button.btn' + (s.source.mode == 'normal' ? '.active' : ''), {
                            onclick: function(){
                                s.source._ctrl.normal(0);
                            }
                        }, 'Normal'),
                        m('button.btn' + (s.source.mode == 'auto' ? '.active' : ''), {
                            onclick: function(){
                                s.source._ctrl.getStatus();
                                //s.source._ctrl.single(0);
                            }
                        }, 'Auto'),
                        m('button.btn' + (s.source.mode == 'single' ? '.active' : ''), {
                            onclick: function(){
                                s.source._ctrl.single(0);
                            }
                        }, 'Single')
                    ]))
                ]),
                // GUI: Single Shot and Force Trigger
                m('.form-group', [
                    m('button.btn.col-6', {
                        onclick: function(){
                            s.source._ctrl.single(0);
                        }
                    }, 'Single Shot'),
                    m('button.btn.col-6', {
                        onclick: function(){
                            s.source._ctrl.forceTrigger();
                        }
                    }, 'Force Trigger')
                ]),
                // GUI: Trigger Trace
                m('.form-group', [
                    m('.col-3', m('label.form-label', 'Trigger Trace')),
                    m('select.form-select.col-9', {
                        value: s.source.triggerTrace,
                        onchange: m.withAttr('value', function(v){
                            s.source.triggerTrace = v;
                            s.source.trigger.channel = s.source.traces[s.source.triggerTrace].channelID;
                        })
                    }, s.source.traces.filter(function(t){ return t.type == 'TimeTrace'; }).map(function(t, i){
                        return m('option', { value: i }, t.name);
                    }))
                ]),
                // GUI: Display and select all traces
                m('.form-group', [
                    m('.col-12', m('.btn-group.btn-group-block',
                        s.source.traces.map(function(trace){
                            if(trace.active){
                                return m('button.btn' + (trace._ctrl && s.source.activeTrace == trace._ctrl.id ? '.active' : ''), {
                                    style: { backgroundColor: trace.color },
                                    onclick: function(){
                                        s.source.activeTrace = trace._ctrl.id;
                                    }
                                }, trace.name);
                            } else {
                                return '';
                            }
                        })
                    ))
                ]),
                // GUI: Single Shot and Force Trigger
                m('.form-group', [
                    m('button.btn.col-2[title="Pan Horizontal"]', {
                        onclick: function(){
                            // Pan horizontal
                            activeTrace.scaling.x = 1;
                        }
                    }, m('i.icon.icon-resize-horiz')),
                    m('button.btn.col-2[title="Pan Vertical"]', {
                        onclick: function(){
                            // an vertical
                            activeTrace.scaling.y = 1;
                        }
                    }, m('i.icon.icon-resize-vert')),
                    m('button.btn.col-2' + (s._ctrl && s._ctrl.addingMarker ? '.btn-primary' : ''), {
                        onclick: function(){
                            // TODO: Add Marker
                            s._ctrl.addingMarker = !s._ctrl.addingMarker;
                        }
                    }, m('i.icon.icon-plus')),
                    m('button.btn.col-2', {
                        onclick: function(){
                            // TODO: Zoom -
                        }
                    }, m('i.icon.icon-minus'))
                ]),
            ])
        ];
    }
};