import m from 'mithril';

export const generalPrefPane = {
    view: function(vnode){
        var s = vnode.attrs.scope;
        return [
            m('header.text-center', m('h4', s)),
            m('.form-horizontal', [
                m('.form-group', [
                    m('.col-12', m('.btn-group.btn-group-block', [
                        m('button.btn' + (s.mode == 'normal' ? '.active' : ''), {
                            onclick: function(e){
                                s.traces.forEach(function(t){
                                    t.node.source.node.ctrl.normal()
                                });
                                s.mode = 'normal';
                            }
                        }, 'Normal'),
                        m('button.btn' + (s.mode == 'auto' ? '.active' : ''), {
                            onclick: function(e){
                                s.traces.forEach(function(t){
                                    t.node.source.node.ctrl.auto()
                                });
                                s.mode = 'auto';
                            }
                        }, 'Auto'),
                        m('button.btn' + (s.mode == 'single' ? '.active' : ''), {
                            onclick: function(e){
                                s.traces.forEach(function(t){
                                    // TODO fix this (will trigger a trace multiple times)
                                    t.node.source.node.ctrl.single();
                                });
                                s.mode = 'single';
                            }
                        }, 'Single')
                    ]))
                ]),
                m('.form-group', [
                    m('button.btn.col-6', {
                        onclick: function(e){
                                s.traces.forEach(function(t){
                                    t.node.source.node.ctrl.single();
                                });
                                s.mode = 'single';
                            }
                    }, 'Single Shot'),
                    m('button.btn.col-6', {
                        onclick: function(e){
                                s.traces.forEach(function(t){
                                    t.node.source.node.ctrl.forceTrigger();
                                });
                            }
                    }, 'Force Trigger')
                ]),
            ])
        ];
    }
}