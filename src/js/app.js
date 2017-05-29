/*
* This file is the main app file.
* It holds the controller and the view and links them both.
*/

import m from 'mithril';

import * as conf from './conf.js';
import { router } from './nodes/router.js';
import { scopeView } from './nodes/scopeView.js';

import '../css/main.css';

//use default mode
m.route.mode = 'search';

var appState = {
    nodes: {
        traces: [
            {
                id: 3,
                name: 'Trace ' + 1,
                top: 150,
                left: 350,
                source: { id: 2 },
                type: 'NormalTrace'
            },
            {
                id: 4,
                name: 'Trace ' + 2,
                top: 350,
                left: 350,
                source: { id: 2 },
                type: 'FFTrace',
            }
        ],
        sources: [
            {
                id: 2,
                name: 'Source ' + 1,
                top: 300,
                left: 50,
                type: 'WebsocketSource',
                location: 'ws://10.84.130.54:50090',
                // location: 'ws://localhost:50090',
                frameSize: 4096,
                buffer: {
                    upperSize: 4,
                    lowerSize: 1,
                },
                trigger: {
                    type: 'risingEdge',
                    level: 0,
                    channel: 1,
                    hysteresis: 2,
                    slope: 0
                },
                numberOfChannels: 2,
                mode: 'normal'
            }
        ],
        scopes: [{
            id: 1,
            name: 'Scope ' + 1,
            top: 250,
            left: 650,
            traces: [
                {
                    id: 3,
                    offset: 0,
                    info: {},
                    color: '#E85D55'
                },
                {
                    id: 4,
                    offset: 0,
                    windowFunction: 'hann',
                    SNRmode: 'auto',
                    info: {},
                    color: '#E8830C'
                },
            ],
            markers: [
                { id: 1, type: 'horizontal', x: 0, y: 0 },
                { id: 2, type: 'vertical', x: 0.5, y: 0 },
                { id: 'SNRfirst', type: 'vertical', x: 0 },
                { id: 'SNRsecond', type: 'vertical', x: 0 },
            ],
            mode: 'normal',
            scaling: {
                x: 1,
                y: 1,
            },
            ui: {
                mover: {
                    width: 50,
                    height: 20,
                    horizontalPosition: 0,
                },
                prefPane: {
                    open: true,
                    width: 400,
                }
            },
            frameSize: 4096,
            samplingRate: 1000000,
            source: {
                id: 2,
                name: 'Source ' + 1,
                top: 300,
                left: 50,
                location: 'ws://10.84.130.54:50090',
                // location: 'ws://localhost:50090',
                frameSize: 4096,
                buffer: {
                    upperSize: 4,
                    lowerSize: 1,
                },
                trigger: {
                    type: 'risingEdge',
                    level: 0,
                    channel: 1,
                    hysteresis: 2,
                    slope: 0
                },
                numberOfChannels: 2,
                mode: 'normal'
            }
        }],
        count: 8
    }
};

window.appState = appState;

window.addEventListener('load', function() {
    m.route(document.body, '/routing', {
        '/routing': {
            controller: function() {}, 
            view: function() {
                return m(router, appState);
            },
            oncreate: function(){
                var popup = window.open(window.location.pathname + '#!/scope?id=1');
                popup.scopeState = appState.nodes.scopes[0];
            }
        },
        '/scope': {
            controller: function() {},
            view: function() {
                return m(scopeView, {
                    // width: conf.canvasSize.width,
                    // height: conf.canvasSize.height,
                    scope: window.scopeState
                });
            },
        }
    });
});