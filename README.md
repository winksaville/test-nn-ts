# A simple artificial neural network library in TypeScript

Based on my [test-nn](https://github.com/winksaville/test-nn) which is based
on the [Step by Step Guide to Implementing a Neural Network in C](http://www.cs.bham.ac.uk/~jxb/INC/nn.html)
by [John A. Bullinaria](http://www.cs.bham.ac.uk/~jxb/).

# Performance
Below are 4 runs testing Nodev8 and Nodev9 compiled for ES5 and ES6.
What we see is that on Nodev8 ES5 is 6x times faster than ES6, 481,000 vs 75,000 eps.

For Nodev9 ES5 and ES6 run approximately the same speed 820,000 eps which is
about 1.7x faster than Nodev8 using ES5!

# Nodev8 Version info:
```
$ node --version
v8.1.2

$ node -e "console.log(process.versions.v8)"
5.8.283.41
```

# Nodev9 Version info:
```
$ ./nodev9/bin/node --version
v9.0.0-v8-canary201706199cf43ea3fd

$ ./nodev9/bin/node -e "console.log(process.versions.v8)"
6.1.0 (candidate)
```

# Run using Nodev8 compiled for ES5
```
$ node build/test-nn.js 10000000
Epoch=10,000,000 Error=4.58e-8 time=20.76s eps=481,765

Pat	Input0	Input1	Target0	Output0
0	0	0	0	0.00014153806736740904
1	1	0	1	0.9998568235021613
2	0	1	1	0.9998568475569924
3	1	1	0	0.0001748320545000856
```

# Run using Nodev8 compiled for ES6
```
$ node build/test-nn.js 10000000
Epoch=10,000,000 Error=4.58e-8 time=132.83s eps=75,284

Pat	Input0	Input1	Target0	Output0
0	0	0	0	0.00014153806736740904
1	1	0	1	0.9998568235021613
2	0	1	1	0.9998568475569924
3	1	1	0	0.0001748320545000856
```

# Rnn using Nodev9 compiled for ES5
```
$ nodev9/bin/node build/test-nn.js 10000000
Epoch=10,000,000 Error=4.58e-8 time=12.10s eps=826,241

Pat	Input0	Input1	Target0	Output0
0	0	0	0	0.00014153806736740904
1	1	0	1	0.9998568235021613
2	0	1	1	0.9998568475569924
3	1	1	0	0.0001748320545000856
```

# Rnn using Nodev9 compiled for ES6
```
$ nodev9/bin/node build/test-nn.js 10000000
Epoch=10,000,000 Error=4.58e-8 time=12.23s eps=817,394

Pat	Input0	Input1	Target0	Output0
0	0	0	0	0.00014153806736740904
1	1	0	1	0.9998568235021613
2	0	1	1	0.9998568475569924
3	1	1	0	0.0001748320545000856
```
