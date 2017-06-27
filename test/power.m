%%
clear all; close all; clc;

N = 2048;
n = 1:N;

fs = 200e3; T = 1/fs;
f = 1e3;

x = cos(2*pi*f*n*T);

figure; plot(n, x)

X = fft(x);

Px = sum(x.^2)/N

PX = sum(abs(X).^2)/N^2

Xone = X(1:N/2+1);
Xone(2:end) = 2*Xone(2:end);

PXone = sum(abs(Xone).^2)/(2*N^2)

df = fs/N;

Pm = sum(abs(Xone).^2)/(2*N^2*df);

P = sum(Pm*df)


