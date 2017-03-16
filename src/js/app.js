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
            source: { id: 4},
            type: 'NormalTrace',
            color: '#E8830C'
        },
        {
            id: 1,
            name: 'Trace ' + 1,
            top: 150,
            left: 350,
            source: { id: 5},
            type: 'NormalTrace',
            color: '#E85D55'
        },
        {
            id: 2,
            name: 'Trace ' + 2,
            top: 250,
            left: 350,
            source: { id: 6},
            type: 'NormalTrace',
            color: '#78FFCE'
        },
        {
            id: 3,
            name: 'Trace ' + 3,
            top: 350,
            left: 350,
            source: { id: 6},
            type: 'FFTrace',
            color: '#E8830C'
        }],
        sources: [{
            id: 4,
            name: 'Source ' + 4,
            top: 50,
            left: 50,
            type: 'Waveform',
            gain: 1,
            frequency: 0.6,
        },
        {
            id: 5,
            name: 'Source ' + 5,
            top: 300,
            left: 50,
            type: 'Waveform',
            gain: 0.7,
            frequency: 0.2,
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
            traces: [
                {
                    id: 0,
                    offset: 0,
                },
                {
                    id: 1,
                    offset: 0,
                },
                {
                    id: 2,
                    offset: 0,
                },
                {
                    id: 3,
                    offset: 0,
                },
            ],
            triggerLevel: 0,
            markers: [
                { id: 1, type: 'horizontal', x: 0, y: 0 },
                { id: 2, type: 'vertical', x: 0.5, y: 0 }
            ],
            autoTriggering: true,
            triggerTrace: { id: 0 },
            triggerType: 'rising',
            scaling: 1,
            ui: {
                mover: {
                    width: 50,
                    height: 20,
                    horizontalPosition: 0,
                }
            }
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
                return m(scopeView, {
                    width: conf.canvasSize.width,
                    height: conf.canvasSize.height,
                    scope: window.scopeState
                });
            }
        }
    });
});