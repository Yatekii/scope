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
                var targetID = info.target.id.split('-')[1];
                
                var trace = null;
                var source = getNodeByID(vnode.attrs.nodes.sources, sourceID);
                if(source.length < 1){
                    trace = getNodeByID(vnode.attrs.nodes.traces, sourceID)[0];
                    var scope = getNodeByID(vnode.attrs.nodes.scopes, targetID)[0];
                    if (getNodeByID(scope.traces, sourceID).length == 0) {
                        scope.traces.push({ id: sourceID, node: trace, offset: 0 });
                        console.log('Connected new trace to scope.');
                        return;
                    }
                    console.log('Trace already connected to scope.');
                    return;
                    // TODO: Look in sinks too since they can be targets as well!
                } else {
                    source = source[0];
                    trace = getNodeByID(vnode.attrs.nodes.traces, targetID);
                    if(trace.length > 0){
                        trace = trace[0];
                        trace.source = {
                            id: sourceID,
                            node: source
                        };
                        console.log('Connected source to trace.');
                        return;
                    }
                }
            });

            // Bind connectionDetached event
            jsPlumb.bind('connectionDetached', function(info) {
                var targetID = info.target.id.split('-')[1];
                var trace = getNodeByID(vnode.attrs.nodes.traces, targetID);
                if(trace.length < 1){
                    var sourceID = info.source.id.split('-')[1];
                    var scope = getNodeByID(vnode.attrs.nodes.scopes, targetID)[0];
                    scope.traces = scope.traces.filter(obj => obj.id != sourceID);
                    console.log('Removed trace from the scope');
                    return;
                    // TODO: Look in sinks too since they can be targets as well!
                } else {
                    trace = trace[0];
                    trace.source = null;
                    console.log('Removed source from trace.');
                    return;
                }
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
                        //anchors: [['Right', {shape:'Rectangle'}], ['Left', {shape:'Rectangle'}]]
                    });
                }
            }, this);

            vnode.attrs.nodes.scopes.forEach(function(scope) {
                if(scope.traces){
                    scope.traces.forEach(function(trace){
                        var node = getNodeByID(vnode.attrs.nodes.traces, trace.id)[0];
                        trace.node = node;
                        jsPlumb.connect({
                            source: 'node-' + node.id,
                            target: 'node-' + scope.id,
                            endpoint: 'Dot',
                            //anchors: [['Right', {shape:'Rectangle'}], ['Left', {shape:'Rectangle'}]]
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