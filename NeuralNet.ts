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
import * as debugModule from "debug";
const dbg = debugModule("NeuralNet");

import Neuron from './Neuron';

export default class NeuralNet {

    private max_layers: number;         // Maximum layers in the nn
    // layers[0] input layer
    // layers[max_layers-2] first hidden layer if max_layers > 2
    // layers[max_layers-1] output layer
    private out_layer: number;          // layers[out_layer] is output layer
    private last_hidden: number;        // layers[last_hidden] is last hidden layer
    private error: number;              // The overall network error
    private learning_rate: number;      // Learning rate aka 'eta'
    private momentum_factor: number;    // Momentum factor aka 'aplha'
    private points: number;             // Points is number

    private input: number[];            // Input pattern

    // There will always be at least two layers,
    // plus there are zero or more hidden layers.
    layers: Neuron[][];

    constructor(num_in_neurons: number, num_hidden_layers: number, num_out_neurons: number) {
        dbg(`ctor:+ in_neurons=${num_in_neurons} hidden_layers=${num_hidden_layers} out_neurons=${num_out_neurons}`);

        this.max_layers = 2; // We always have an input and output layer
        this.max_layers += num_hidden_layers; // Add num_hidden layers
        this.out_layer = this.max_layers - 1;  // last one is out_layer
        this.last_hidden = 0; // No hidden layers yet
        this.points = 0; // No points yet
        this.error = 0;       // No errors yet
        this.learning_rate = 0.5; // Learning rate aka eta
        this.momentum_factor = 0.9; // momemtum factor aka alpha

        this.layers = new Array(this.max_layers);

        // Create the input and output layers
        this.create_layer(0, num_in_neurons);
        this.create_layer(this.out_layer, num_out_neurons);

        dbg("ctor:-");
    }

    create_layer(layer_index: number, num_neurons: number) {
        dbg(`create_layer:+ layer_index=${layer_index} num_neurons=${num_neurons}`);

        this.layers[layer_index] = new Array(num_neurons);

        dbg(`create_layer:- layer_index=${layer_index} num_neurons=${num_neurons}`);
    }

    add_hidden(num_neurons: number) {
        dbg(`add_hidden:+ num_neurons=${num_neurons}`);

        this.last_hidden += 1;
        if (this.last_hidden >= (this.max_layers - 1)) {
            throw new Error('STATUS_TO_MANY_HIDDEN');
        }
        this.create_layer(this.last_hidden, num_neurons);

        dbg(`add_hidden:- num_neurons=${num_neurons}`);
    }

    set_inputs(input: number[]) {
        dbg(`set_inputs:+ count=${input.length} input_layer count=${this.layers[0].length}`);
        for (let n = 0; n < this.layers[0].length; n++) {
            // Set then input neuron output
            let neuron = this.layers[0][n];
            neuron.output = input[n];
            dbg(`set_inputs: neuron=${n} output=${neuron.output}`);
        }
        dbg("set_inputs:-");
    }

    process() {
        dbg("process:+");
        // Calcuate the output for the fully connected layers,
        // which start at this.layers[1]
        for (let l = 1; l <= this.out_layer; l++) {
            let layer = this.layers[l];
            for (let n = 0; n < layer.length; n++) {
                // Get the next neuron
                let neuron = layer[n];

                // Neuron's inputs and weights arrays
                let inputs = neuron.inputs;
                let weights = neuron.weights;

                // Initialize the weighted_sum to the first weight, this is the bias
                let weight_index = 0;
                let weighted_sum = weights[weight_index];

                // Skip past bias
                weight_index += 1;

                // Loop though all of the neuron's inputs summing inputs scaled
                // by the weight
                for (let i = 0; i < neuron.inputs.length; i++) {
                    weighted_sum += weights[i] * inputs[i].output;
                }

                // Calcuate the output using a Sigmoidal Activation function
                neuron.output = 1.0 / (1.0 + Math.exp(-weighted_sum));
                dbg(`process: neuron=${n} output=${neuron.output} weighted_sum=${weighted_sum}`);
            }
        }
        dbg("process:-");
    }

    get_outputs(output: number[]) {
        dbg(`get_outputs:+ output.length=${output.length}`);

        if (output.length !== this.layers[this.out_layer].length) {
            throw new Error(`get_outputs: output.length=${output.length} !== ${this.layers[this.out_layer].length}`);
        }
        for (let i = 0; i < output.length; i++) {
            output[i] = this.layers[this.out_layer][i].output;
            dbg(`get_outputs: output[${i}]=${output[i]}`);
        }

        dbg(`get_outputs:- output.length=${output.length}`);
    }

    start() {
        dbg("start:+");

        // Check if the user added all of the hidden layers they could
        if ((this.last_hidden + 1) < (this.max_layers - 1)) {
            // Nope, there were fewer hidden layers than there could be
            // so move the output layer to be after the last hidden layer
            this.out_layer = this.last_hidden + 1;
            this.layers[this.out_layer].length = this.layers[this.max_layers - 1].length;
            this.layers[this.out_layer] = this.layers[this.max_layers - 1];
            this.layers[this.max_layers - 1] = null;
        }

        dbg(`start: max_layers=${this.max_layers} last_hidden=${this.last_hidden} out_layer=${this.out_layer}`);

        // Initialize the neurons for all of the layers
        this.points = 0;
        for (let l = 0; l < this.max_layers; l++) {
            let in_layer: Neuron[];
            if (l == 0) {
                // Layer 0 is the input layer so it has no inputs
                in_layer = null;
            } else {
                in_layer = this.layers[l-1];
            }
            dbg(`start: this.layers[${l}].length=${this.layers[l].length} in_layer=${l}`);
            for (let n = 0; n < this.layers[l].length; n++) {
                this.layers[l][n] = new Neuron(in_layer);
                this.points += this.layers[l][n].points;
            }
        }

        // Add the number of outputs since we're currently
        // not displaying outputs of hidden layers
        this.points += this.layers[this.out_layer].length;

        // Add two more for the bounding box
        this.points += 2;

        dbg("start:-");
    }
}
