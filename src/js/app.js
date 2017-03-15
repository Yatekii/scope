/*
* This file is the main app file.
* It holds the controller and the view and links them both.
*/

import m from 'mithril';

import * as conf from './conf.js';
import { getNodeByID } from './helpers.js';
import { router } from './nodes/router.js';
import { scopeView } from './nodes/scopeView.js';

import '../css/main.css';

//use default mode
m.route.mode = 'search';

var appState = {
    nodes: {
        traces: [{
            id: 0,
            name: 'Trace ' + 0,
            top: 50,
            left: 350,
            source: { id: 4}
        },
        {
            id: 1,
            name: 'Trace ' + 1,
            top: 150,
            left: 350,
            source: { id: 5}
        },
        {
            id: 2,
            name: 'Trace ' + 2,
            top: 250,
            left: 350,
            source: { id: 6}
        },
        {
            id: 3,
            name: 'Trace ' + 3,
            top: 350,
            left: 350,
            source: { id: 6}
        }],
        sources: [{
            id: 4,
            name: 'Source ' + 4,
            top: 50,
            left: 50,
            type: 'Waveform',
            gain: 1,
            frequency: 1000,
        },
        {
            id: 5,
            name: 'Source ' + 5,
            top: 300,
            left: 50,
            type: 'Waveform',
        },
        {
            id: 6,
            name: 'Source ' + 6,
            top: 550,
            left: 50,
            type: 'Microphone',
        }],
        scopes: [{
            id: 7,
            name: 'Scope ' + 7,
            top: 250,
            left: 650,
            traces: { ids: [0, 1, 2, 3] },
            triggerLevel: 50,
            markers: [
                { id: 1, type: 'horizontal', x: 0, y: 80 },
                { id: 2, type: 'vertical', x: 200, y: 0 }
            ],
            autoTriggering: true,
            triggerMoving: false,
            triggerTrace: 0,
            triggerType: 'rising',
        }],
        count: 8
    }
};

window.addEventListener('load', function() {
    m.route(document.body, '/routing', {
        '/routing': {
            controller: function() {}, 
            view: function() {
                return m(router, appState);
            }
        },
        '/scope': {
            controller: function() {},
            view: function(vnode) {
                var scope = getNodeByID(appState.nodes.scopes, vnode.attrs.id);
                if(scope.length < 1){
                    return m('', 'Scope does not exist!');
                }
                return m(scopeView, {
                    width: conf.canvasSize.width,
                    height: conf.canvasSize.height,
                    scope: scope[0]
                });
            }
        }
    });
});