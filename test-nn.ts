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

import * as debugModule from "debug";
const dbg = debugModule("test-nn");

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

function main(argv: string[]) {
    try {
        dbg("main:+");
        debugger;

        if (argv.length < 4) {
            console.log(`Usage: yarn test <number of epochs> <output path>`);
            argv.forEach((val, index) => {
                console.log(`${index}: ${val}`);
            });

            return;
        }
        Math.random = seedrandom('1');
        dbg(`main: random=${Math.random()}`);

        let epoch_count: number = parseInt(argv[2]);
        let out_path: string = argv[3];

        dbg(`main: epoch_count=${epoch_count} out_path=${out_path}`);
        
        dbg("main: create nn");
        let num_inputs = 2;
        let num_hidden = 1;
        let num_outputs = 1;
        let nn = new NeuralNet(num_inputs, num_hidden, num_outputs);
        dbg("main: created nn");

        // Create a two neuron hidden layer
        let hidden_neurons = 2;
        nn.add_hidden(hidden_neurons);
        
        // Start the Neural net
        nn.start();

        let error = 0.999;
        let error_threshold = 0.0004;
        let pattern_count = xor_input_patterns.length;
        let rand_ps = Array<number>(pattern_count);
        for (let epoch = 0; epoch < epoch_count; epoch++) {
            // Shuffle rand_patterns by swapping the current
            // position t with a random location after the
            // current position.

            // Start by resetting to sequential order
            for (let p = 0; p < pattern_count; p++) {
                rand_ps[p] = p;
            }

            // Shuffle
            for (let p = 0; p < pattern_count; p++) {
                let r0_1 = Math.random();
                let rp = p + Math.floor(r0_1 * (pattern_count - p));
                let t = rand_ps[p];
                rand_ps[p] = rand_ps[rp];
                rand_ps[rp] = t;
                dbg(`r0_1=${r0_1} rp=${rp} rand_ps[${p}]=${rand_ps[p]}`);
            }

            // Process the pattern and accumulate the error
            for (let rp = 0; rp < pattern_count; rp++) {
                let p = rand_ps[rp];
                nn.set_inputs(xor_input_patterns[p]);
                nn.process();
                //xor_output[p].count = OUTPUT_COUNT;
                //nn.get_outputs(xor_output[p]);
                //error += nn.adjust_weights(xor_output[p], xor_target_patterns[p]);

                //writer.begin_epoch(&writer, (epoch * pattern_count) + rp);
                //writer.write_epoch(&writer);
                //writer.end_epoch(&writer);
            }

            // Output some progress info
            if ((epoch % 100) == 0) {
                console.log(`Epoch=${epoch}: error=${error}`);
            }

            // Stop if we've reached the error_threshold
            if (error < error_threshold) {
              break;
            }
        }
    } catch(err) {
        console.log(`main: Error=${err}`);
        throw err;
    } finally {
        dbg("main:-");
    }
}

main(process.argv);
