import m from 'mithril';
import { jsPlumb } from 'jsplumb';
import { sourceNode } from './source.js';
import { traceNode } from './trace.js';
import { scopeNode } from './scope.js';
import { getNodeByID } from '../helpers.js';

export const router = {
    oninit: function(vnode) {
        jsPlumb.bind('ready', function(){
            // Bind connection event
            jsPlumb.bind('connection', function(info) {
                var sourceID = info.source.id.split('-')[1];
                var source = getNodeByID(vnode.attrs.nodes.sources, sourceID);
                if(source.length < 1){
                    // TODO: Look in traces too since they can be sources to sinks and scopes too!
                } else {
                    source = source[0];
                }
                var targetID = info.target.id.split('-')[1];
                var target = getNodeByID(vnode.attrs.nodes.traces, targetID);
                if(target.length < 1){
                    // TODO: Look in sinks and scopes too since they can be targets as well!
                } else {
                    target = target[0];
                }
                target.source = {
                    id: sourceID,
                    node: source
                };
            });

            // Bind connectionDetached event
            jsPlumb.bind('connectionDetached', function(info) {
                var targetID = info.target.id.split('-')[1];
                var target = getNodeByID(vnode.attrs.nodes.traces, targetID);
                if(target.length < 1){
                    // TODO: Look in sinks and scopes too since they can be targets as well!
                } else {
                    target = target[0];
                }
                target.source = null;
            });
        });
    },
    view: function(vnode) {
        return [
            vnode.attrs.nodes.sources.map(node => m(sourceNode, node)),
            vnode.attrs.nodes.traces.map(node => m(traceNode, node)),
            vnode.attrs.nodes.scopes.map(node => m(scopeNode, node))
        ];
    },
    oncreate: function(vnode){
        jsPlumb.bind('ready', function(){
            vnode.attrs.nodes.traces.forEach(function(trace) {
                if(trace.source){
                    trace.source.node = getNodeByID(vnode.attrs.nodes.sources, trace.source.id)[0];
                    jsPlumb.connect({
                        source: 'node-' + trace.source.node.id,
                        target: 'node-' + trace.id,
                        endpoint: 'Dot',
                        anchors: [['Right', {shape:'Circle'}], ['Left', {shape:'Circle'}]]
                    });
                }
            }, this);

            vnode.attrs.nodes.scopes.forEach(function(scope) {
                if(scope.traces){
                    scope.traces.nodes = [];
                    scope.traces.ids.forEach(function(trace){
                        var node = getNodeByID(vnode.attrs.nodes.traces, trace)[0];
                        scope.traces.nodes.push(node);
                        jsPlumb.connect({
                            source: 'node-' + node.id,
                            target: 'node-' + scope.id,
                            endpoint: 'Dot',
                            anchors: [['Right', {shape:'Circle'}], ['Left', {shape:'Circle'}]]
                        });
                    })
                }
            }, this);
        });
    },
    addTrace: function(trace) {
        this.state.nodes.traces.push({
            node: traceNode,
            state: {
                id: this.state.nodes.count,
                name: 'Trace ' + this.state.nodes.count
            }
        });
        this.state.nodes.count++;
        m.redraw();
    },
    addSource: function(source) {
        this.state.nodes.sources.push({
            node: sourceNode,
            state: {
                id: this.state.nodes.count,
                name: 'Source ' + this.state.nodes.count
            }
        });
        this.state.nodes.count++;
        m.redraw();
    }
};