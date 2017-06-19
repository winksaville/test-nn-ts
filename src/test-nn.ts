/*
 * Copyright 2017 Wink Saville
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as process from 'process';
import NeuralNet from './NeuralNet';
import * as seedrandom from "seedrandom";
import rand0_1 from "./rand0_1";
import * as  microtime from "microtime";
import * as  numeral from "numeral";

import dbg from './Debug';


let xor_input_patterns: number[][] = [
    [ 0, 0 ],
    [ 1, 0 ],
    [ 0, 1 ],
    [ 1, 1 ]
];

let xor_target_patterns: number[][] = [
    [ 0 ],
    [ 1 ],
    [ 1 ],
    [ 0 ]
];

let xor_output: number[][] = [
    [ 0 ],
    [ 0 ],
    [ 0 ],
    [ 0 ]
];

function consolew(s: string) {
    process.stdout.write(s);
}

function main(argv: string[]) {
    try {
        let epoch_count = 0.0;
        let error_threshold = 0.0004;

        dbg("test-nn:+");
        debugger;

        let MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

        if (argv.length < 3) {
            console.log("Usage: %s <param1>\n", argv[0]);
            console.log("  param1: if param1 >= 1 then number of epochs");
            console.log("          else if param1 >= 0.0 && param1 < 1.0 then error threshold typical = 0.0004");
            console.log("          else param1 invalid");
            process.exit(0);
        }

        error_threshold = parseFloat(argv[2]);
        if (error_threshold < 0.0) {
            console.log(`param1:${numeral(error_threshold).format("0.00")} < 0.0, aborting`);
            process.exit(1);
        } else if ((error_threshold > 0.0) && (error_threshold < 1.0)) {
            epoch_count = MAX_SAFE_INTEGER;
        } else {
            let count = Math.floor(error_threshold);
            if (count > MAX_SAFE_INTEGER) {
                console.log(`param1:${numeral(count).format("0.00")} > `
                            + `${numeral(MAX_SAFE_INTEGER).format("0,0")}, aborting`);
                process.exit(1);
            }
            epoch_count = count;
            error_threshold = 0.0;
        }

        Math.random = seedrandom('1');

        dbg(`test-nn: epoch_count=${epoch_count}`);
        
        let num_inputs = 2;
        let num_hidden = 1;
        let num_outputs = 1;
        let nn = new NeuralNet(num_inputs, num_hidden, num_outputs);

        // Create a two neuron hidden layer
        let hidden_neurons = 2;
        nn.add_hidden(hidden_neurons);
        
        // Start the Neural net
        nn.start();

        let epoch = 0;
        let error = 0.0;
        let pattern_count = xor_input_patterns.length;
        let rand_ps = Array<number>(pattern_count);

        // Added so output is the same as test-nn.c where
        // nn.get_points is called with the writer is initialized.
        //let pts = nn.get_points();

        let start_sec: number = microtime.nowDouble();
        for (epoch = 0; epoch < epoch_count; epoch++) {
            error = 0.0;

            // Shuffle rand_patterns by swapping the current
            // position t with a random location after the
            // current position.

            // Start by resetting to sequential order
            for (let p = 0; p < pattern_count; p++) {
                rand_ps[p] = p;
            }

            // Shuffle
            for (let p = 0; p < pattern_count; p++) {
                let r0_1 = rand0_1();
                let rp = p + Math.floor(r0_1 * (pattern_count - p));
                let t = rand_ps[p];
                rand_ps[p] = rand_ps[rp];
                rand_ps[rp] = t;
                //dbg(`r0_1=${r0_1} rp=${rp} rand_ps[${p}]=${rand_ps[p]}`);
            }

            // Process the pattern and accumulate the error
            for (let rp = 0; rp < pattern_count; rp++) {
                let p = rand_ps[rp];
                nn.set_inputs(xor_input_patterns[p]);
                nn.process();
                nn.get_outputs(xor_output[p]);
                error += nn.adjust_weights(xor_output[p], xor_target_patterns[p]);
            }

            // Stop if we've reached the error_threshold
            if (error < error_threshold) {
                break;
            }
        }
        let end_sec: number = microtime.nowDouble();
        let time_sec = end_sec - start_sec
        let eps = epoch / time_sec;

        console.log(`Epoch=${numeral(epoch).format("0,0")}`
            + ` Error=${numeral(error).format("0.00e+0")}`
            + ` time=${numeral(time_sec).format("0.00")}s`
            + ` eps=${numeral(eps).format("0,0")}`
        );

        nn.stop();

        consolew("\nPat");
        for (let i = 0; i < xor_input_patterns[0].length; i++) {
            consolew(`\tInput${i}`);
        }
        for (let t = 0; t < xor_target_patterns[0].length; t++) {
            consolew(`\tTarget${t}`);
        }
        for (let o = 0; o < xor_output[0].length; o++) {
            consolew(`\tOutput${0}`);
        }
        consolew("\n");
        for (let p = 0; p < pattern_count; p++) {
            consolew(`${p}`);
            for (let i = 0; i < xor_input_patterns[p].length; i++) {
                consolew(`\t${xor_input_patterns[p][i]}`);
            }
            for (let t = 0; t < xor_target_patterns[p].length; t++) {
                consolew(`\t${xor_target_patterns[p][t]}`);
            }
            for (let o = 0; o < xor_output[p].length; o++) {
                consolew(`\t${xor_output[p][o]}`);
            }
            consolew("\n");
        }
    } catch(err) {
        console.log(`test-nn: Error=${err}`);
        throw err;
    } finally {
        dbg("test-nn:-");
    }
}

main(process.argv);
