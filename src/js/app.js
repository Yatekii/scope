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
    scopes: [{
        id: 1,
        name: 'Scope ' + 1,
        top: 250,
        left: 350,
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
            samplingRate: 5000000,
            bits: 16,
            vpp: 2.1, // Volts per bit
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
            activeTrace: 1,
            traces: [
                {
                    id: 3,
                    active: false,
                    offset: { x: 0, y: 0 },
                    _info: {},
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
                    active: true,
                    offset: { x: 0, y: 0 },
                    windowFunction: 'hann',
                    halfSpectrum: true,
                    SNRmode: 'auto',
                    calculateSNR: true,
                    _info: {},
                    name: 'Trace ' + 2,
                    channelID: 1,
                    type: 'FFTrace',
                    color: '#E8830C',
                    scaling: {
                        x: 1,
                        y: 1,
                    },
                    markers: [
                        {
                            id: 'SNRfirst',
                            type: 'vertical',
                            x: 0,
                            dashed: true,
                            color: 'purple',
                            active: true,
                        },
                        {
                            id: 'SNRsecond',
                            type: 'vertical',
                            x: 0,
                            dashed: true,
                            color: 'purple',
                            active: true,
                        },
                        {
                            id: 'PWRfirst',
                            type: 'vertical',
                            x: 0.2,
                            dashed: true,
                            color: 'red',
                            active: true,
                        },
                        {
                            id: 'PWRsecond',
                            type: 'vertical',
                            x: 0.3,
                            dashed: true,
                            color: 'red',
                            active: true,
                        },
                    ]
                },
                // {
                //     id: 5,
                //     offset: { x: 0, y: 0.25 },
                //     _info: {},
                //     name: 'Trace ' + 9001,
                //     channelID: 0,
                //     type: 'TimeTrace',
                //     color: '#FF0000',
                //     scaling: {
                //         x: 1,
                //         y: 1,
                //     },
                // },
                // {
                //     id: 6,
                //     offset: { x: 0, y: 0.5 },
                //     windowFunction: 'hann',
                //     halfSpectrum: true,
                //     SNRmode: 'auto',
                //     _info: {},
                //     name: 'Trace ' + 3000,
                //     channelID: 0,
                //     type: 'FFTrace',
                //     color: '#BFA688',
                //     scaling: {
                //         x: 1,
                //         y: 1,
                //     },
                //     markers: [
                //         {
                //             id: 'SNRfirst',
                //             type: 'vertical',
                //             x: 0,
                //             dashed: true,
                //             color: 'purple',
                //             active: true,
                //         },
                //         {
                //             id: 'SNRsecond',
                //             type: 'vertical',
                //             x: 0,
                //             dashed: true,
                //             color: 'purple',
                //             active: true,
                //         },
                //     ]
                // }
            ],
        }
    }]
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
                popup.scopeState = appState.scopes[0];
                console.log(popup.scopeState);
            }
        },
        '/scope': {
            controller: function() {},
            view: function() {
                return m(scopeView, {
                    scope: window.scopeState
                });
            },
        },
        '/load': {
            view: function(vnode) {
                return [
                    m('textarea', {
                        oninput: m.withAttr('value', function(v){ vnode.state.text = v; })
                    }),
                    m('button', {
                        onclick: function(){
                            var popup = window.open(window.location.pathname + '#!/scope');
                            var scope = JSON.parse(vnode.state.text);
                            scope.source.traces.forEach(function(trace) {
                                trace._source = scope.source;
                            }, this);
                            scope.source._scope = scope;
                            popup.scopeState = scope;
                        }
                    })
                ];
            },
        }
    });
});