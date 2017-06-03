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
import * as NN from './NeuralNet';

import * as debugModule from "debug";
const dbg = debugModule("test-nn");

function main(argv: string[]) {
    try {
        dbg("test-nn:+");

        if (argv.length < 4) {
            console.log(`Usage: yarn test <number of epochs> <output path>`);
            argv.forEach((val, index) => {
                console.log(`${index}: ${val}`);
            });

            return;
        }
        let epoch_count: number = parseInt(argv[2]);
        let out_path: string = argv[3];

        console.log(`epoch_count=${epoch_count} out_path=${out_path}`);
        
        dbg("test-nn: create nn");
        let num_inputs = 2;
        let num_hidden = 1;
        let num_outputs = 1;
        let nn = new NN.NeuralNet(num_inputs, num_hidden, num_outputs);
        dbg("test-nn: created nn");

    } catch(err) {
        console.log(`test-nn: Error=${err}`);
    } finally {
        dbg("test-nn:-");
    }
}

main(process.argv);
