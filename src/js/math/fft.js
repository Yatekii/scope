/*
 * Calculates an FFT over a set of samples.
 * <re> : float[] : An array containing the real parts of the samples
 * <im> : float[] : An array containing the imaginary parts of the samples
 * NOTE: The calculated FFT will be contained within the input vectors.
 */
export const miniFFT = function(re, im) {
    var N = re.length;
    var i, j, h, k;
    for (i = 0; i < N; i++) {
        for(j = 0, h = i, k = N; k >>= 1; h >>= 1){ // eslint-disable-line no-cond-assign
            j = (j << 1) | (h & 1);
        }
        if (j > i) {
            re[j] = [re[i], re[i] = re[j]][0];
            im[j] = [im[i], im[i] = im[j]][0];
        }
    }
    for(var hN = 1; hN * 2 <= N; hN *= 2){
        for (i = 0; i < N; i += hN * 2){
            for (j = i; j < i + hN; j++) {
                var cos = Math.cos(Math.PI * (j - i) / hN);
                var sin = Math.sin(Math.PI * (j - i) / hN);
                var tre =  re[j+hN] * cos + im[j+hN] * sin;
                var tim = -re[j+hN] * sin + im[j+hN] * cos;
                re[j + hN] = re[j] - tre; im[j + hN] = im[j] - tim;
                re[j] += tre; im[j] += tim;
            }
        }
    }
};