/*
* This file is the main app file.
* It holds the app state and initializes the scope.
*/

import m from 'mithril';

import { router } from './nodes/router.js';
import { scopeView } from './nodes/scopeView.js';

import '../css/main.css';

//use default routing mode
m.route.mode = 'search';

var appState = {
    nodes: {
        scopes: [{
            id: 1,
            name: 'Scope ' + 1,
            top: 250,
            left: 350,
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
                bits: 16,
                vpb: 2.2 / Math.pow(2,14), // Volts per bit
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
                triggerTrace: 0,
                triggerPosition: 1 / 8,
                numberOfChannels: 2,
                mode: 'normal',
                activeTrace: 0,
                traces: [
                    {
                        id: 3,
                        offset: { x: 0, y: 0 },
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
                        offset: { x: 0, y: 0 },
                        windowFunction: 'hann',
                        halfSpectrum: true,
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
                        markers: [
                            { id: 'SNRfirst', type: 'vertical', x: 0 },
                            { id: 'SNRsecond', type: 'vertical', x: 0 },
                        ]
                    },
                ],
            }
        }]
    }
};

// Store the app state for later uses to the window
window.appState = appState;

// Add a mithril router to the page
window.addEventListener('load', function() {
    m.route(document.body, '/routing', {
        '/routing': {
            controller: function() {}, 
            view: function() {
                return m(router, appState);
            },
            oncreate: function(){
                // Open scope 1 by default
                var popup = window.open(window.location.pathname + '#!/scope?id=1');
                popup.scopeState = appState.nodes.scopes[0];
            }
        },
        '/scope': {
            controller: function() {},
            view: function() {
                return m(scopeView, {
                    scope: window.scopeState
                });
            },
        }
    });
});