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
import rand0_1 from "./rand0_1";

import dbg from "./Debug";

export default class Neuron {
    inputs: Neuron[];     // Neuron layer of inputs
    weights: number[];    // Array of weights for each input plus the bias
    momentums: number[];  // Array of momentums for each input plus the bias
    output: number;       // The output of this neuron
    pd_error: number;     // Partial derative of this neurons error
    points: number;       // Points is number of graphic points

    constructor(inputs: Neuron[] | null) {
        let weights: number[];
        let momentums: number[];
        let points: number;
        dbg("ctor:+");

        // If inputs is null change to an empty array
        if (inputs == null) {
            inputs = [];
        }

        // Calculate the initial weights. Note weights[0] is the bias
        // so we increase count of weights by one.
        let count = inputs.length + 1;
        weights = new Array<number>(count);

        // Initialize weights >= -0.5 and < 0.5
        dbg(`ctor:  top of loop count=${count}`);
        for (let w = 0; w < count; w++) {
            weights[w] = rand0_1() - 0.5;
            dbg(`ctor: weights[${w}]=${weights[w]}`);
        }

        // Allocate an array of mementums initialize to 0.0
        momentums = new Array<number>(count);
        for (let m = 0; m < count; m++) {
            momentums[m] = 0.0;
        }

        points = count;

        this.inputs = inputs;
        this.weights = weights;
        this.momentums = momentums;
        this.points = points;
        this.output = 0.0;
        this.pd_error = 0.0;

        dbg("ctor:-");
    }
}
