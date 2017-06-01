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
        scopes: [{
            id: 1,
            name: 'Scope ' + 1,
            top: 250,
            left: 350,
            markers: [
                // { id: 1, type: 'horizontal', x: 0, y: 0 },
                // { id: 2, type: 'vertical', x: 0.5, y: 0 },
                { id: 'SNRfirst', type: 'vertical', x: 0 },
                { id: 'SNRsecond', type: 'vertical', x: 0 },
            ],
            mode: 'normal',
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
            source: {
                id: 2,
                name: 'Source ' + 1,
                top: 300,
                left: 50,
                location: 'ws://10.84.130.54:50090',
                // location: 'ws://localhost:50090',
                frameSize: 4096,
                samplingRate: 1000000,
                bits: 14,
                buffer: {
                    upperSize: 4,
                    lowerSize: 1,
                },
                trigger: {
                    type: 'risingEdge',
                    level: 0,
                    channel: 1,
                    hysteresis: 30,
                    slope: 0
                },
                numberOfChannels: 2,
                mode: 'normal',
                activeTrace: 0,
                traces: [
                    {
                        id: 3,
                        offset: 0,
                        info: {},
                        name: 'Trace ' + 1,
                        channelID: 1,
                        type: 'TimeTrace',
                        color: '#E85D55',
                        scaling: {
                            x: 1,
                            y: 1,
                        },
                    },
                    {
                        id: 4,
                        offset: 0,
                        windowFunction: 'hann',
                        SNRmode: 'auto',
                        info: {},
                        name: 'Trace ' + 2,
                        channelID: 1,
                        type: 'FFTrace',
                        color: '#E8830C',
                        scaling: {
                            x: 1,
                            y: 1,
                        },
                    },
                ],
            }
        }]
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