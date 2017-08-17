/*
 * This file holds all the windowing functions to make the visibility of the signal better.
 * Initial file by Richard Meadows (2013).
 */

/*
 * Sinc function:
 *     sin(x)
 * y = ------
 *       x
 */
Math.sinc = function(n) {
    return Math.sin(Math.PI * n) / (Math.PI * n);
};

/* Bessel function:
 *
 * y = I(n)(x)| 
 *          |n=0
 */
Math.bessi0 = function(x) {
    var y;
    var ax = Math.abs(x);
    if (ax < 3.75) {
        y = x / 3.75;
        y = y * y;
        return 1.0 + y * (3.5156229 + y * (3.0899424 + y * (
            1.2067492 + y * (0.2659732 + y * (0.360768e-1 + y * 0.45813e-2))
        )));
    } else {
        y = 3.75 / ax;
        return (Math.exp(ax) / Math.sqrt(ax)) * (
            0.39894228 + y * (0.1328592e-1 + y * (0.225319e-2 + y * (-0.157565e-2 + y * (
                0.916281e-2 + y * (-0.2057706e-1 + y * (0.2635537e-1 + y * (-0.1647633e-1 + y * 0.392377e-2)))
            ))))
        );
    }
};

/*
 * Windowing functions.
 */
export const windowFunctions = {
    rect: {
        fn: function (n, points) { return 1; }, // eslint-disable-line no-unused-vars
        lines: 3,
        name: 'Boxcar',
        CG: 1,
        NG: 1
    },
    hann: {
        fn: function (n, points) { return 0.5 - 0.5 * Math.cos(2 * Math.PI * n / (points - 1)); },
        lines: 3,
        name: 'Hanning',
        CG: 0.54,
        NG: 0.3974
    },
    hamming: {
        fn: function (n, points) { return 0.54 - 0.46 * Math.cos(2 * Math.PI * n/ (points - 1)); },
        lines: 3,
        name: 'Hamming',
        CG: 0.5,
        NG: 0.375
    },
    // cosine: {
    //     fn: function (n, points) { return Math.sin(Math.PI * n / (points - 1)); },
    //     lines: 1
    // },
    // lanczos: {
    //     fn: function (n, points) { return Math.sinc((2 * n / (points - 1)) - 1); },
    //     lines: 1
    // },
    // gaussian:    function (n, points, alpha) {
    //             if (!alpha) { alpha = 0.4; }
    //             return Math.pow(Math.E, -0.5*Math.pow((n-(points-1)/2)/(alpha*(points-1)/2), 2));
    //         },
    // tukey:        function (n, points, alpha) {
    //             if (!alpha) { alpha = 0.5; }

    //             if (n < 0.5*alpha*(points-1)) {
    //                 return 0.5*(1+(Math.cos(Math.PI*((2*n/(alpha*(points-1)))-1))));
    //             } else if (n < (1-(0.5*alpha))*(points-1)) {
    //                 return 1;
    //             } else {
    //                 return 0.5*(1+(Math.cos(Math.PI*((2*n/(alpha*(points-1)))+1-(2/alpha)))));
    //             }
    //         },
    // blackman:    function (n, points, alpha) {
    //             if (!alpha) { alpha = 0.16; }
    //             return 0.42 - 0.5*Math.cos(2*Math.PI*n/(points-1)) + 0.08*Math.cos(4*Math.PI*n/(points-1));
    //         },
    exact_blackman: {
        fn: function (n, points) {
            return 0.4243801 - 0.4973406 * Math.cos( 2 * Math.PI * n / (points - 1))
                + 0.0782793 * Math.cos(4 * Math.PI * n / (points - 1));
        },
        lines: 5,
        name: 'Blackman',
        CG: 0.3587,
        NG: 0.2580
    },
    // kaiser:        function (n, points, alpha) {
    //             if (!alpha) { alpha = 3; }
    //             return Math.bessi0(Math.PI*alpha*Math.sqrt(1-Math.pow((2*n/(points-1))-1, 2))) / Math.bessi0(Math.PI*alpha);
    //         },
    // nuttall:    function (n, points) {
    //     return 0.355768 - 0.487396 * Math.cos(2 * Math.PI * n / (points - 1))
    //         + 0.144232 * Math.cos(4 * Math.PI * n / (points - 1))
    //         - 0.012604 * Math.cos(6 * Math.PI * n / (points - 1));
    // },
    // blackman_harris:function (n, points) {
    //     return 0.35875 - 0.48829 * Math.cos(2 * Math.PI * n / (points - 1))
    //         + 0.14128 * Math.cos(4 * Math.PI * n / (points - 1))
    //         - 0.01168 * Math.cos(6 * Math.PI * n / (points - 1));
    // },
    // blackman_nuttall:function (n, points) {
    //     return 0.3635819 - 0.3635819 * Math.cos(2 * Math.PI * n / (points - 1))
    //         + 0.1365995 * Math.cos(4 * Math.PI * n / (points - 1))
    //         - 0.0106411 * Math.cos(6 * Math.PI * n / (points - 1));
    // },
    flat_top: {
        fn: function (n, points) {
            return 1 - 1.93 * Math.cos(2 * Math.PI * n / (points - 1))
                + 1.29 * Math.cos(4 * Math.PI * n / (points - 1))
                - 0.388 * Math.cos(6 * Math.PI * n / (points - 1))
                + 0.032 * Math.cos(8 * Math.PI * n / (points - 1));
        },
        lines: 9,
        name: 'Flat-Top',
        CG: 0.2156,
        NG: 0.1752
    },
};

/**
 * Applies a Windowing Function to an array.
 * <dataArray>
 */
export const applyWindow = function(dataArray, windowing_function, correction) {
    var datapoints = dataArray.length;

    /* For each item in the array */
    for (var n=0; n<datapoints; ++n) {
        /* Apply the windowing function */
        dataArray[n] *= windowing_function(n, datapoints) * correction;
    }

    return dataArray;
};

export const getWindowCorrection = function(windowing_function, windowSize, fs) {
    // Skalierung berechnen
    var s = 0;
    for (var n = 0; n < windowSize; n++) {
        var w = windowing_function(n, windowSize);
        s += w * w;
    }
    var scale = Math.sqrt(1.0 / (2.0 * fs * s));
    return scale;
};