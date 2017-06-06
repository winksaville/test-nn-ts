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

    stop() {
        dbg("stop:+");
        dbg("stop:-");
    }

    get_points(): number {
        dbg(`get_points:+- points=${this.points}`);
        return this.points;
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
                let weighted_sum = weights[0];

                // Loop though all of the neuron's inputs summing inputs scaled
                // by the weight
                for (let i = 0; i < neuron.inputs.length; i++) {
                    weighted_sum += weights[i+1] * inputs[i].output;
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

    adjust_weights(output: number[], target: number[]): number {
        dbg(`adjust_weights:+ output.length=${output.length} target.length=${target.length}`);

        // Calculate the network error and partial derivative of the error
        // for the output layer
        dbg("\nadjust_weights: calculate pd_error and total_error");
        this.error = 0.0;
        if (output.length !== target.length) {
            throw new Error(`output.length:${output.length} !== target.length:${target.length}`);
        }
        for (let n = 0; n < output.length; n++) {
            // Compute the error as the difference between target and output
            let err = target[n] - output[n];
            dbg(`adjust_weights: ${this.out_layer}:${n} err:${err} =`
                + ` target:${target[n]} + output:${output[n]}`);

            // Compute the partial derivative of the activation w.r.t. error
            let pd_err = err * output[n] * (1.0 - output[n]);
            this.layers[this.out_layer][n].pd_error = pd_err;
            dbg(`adjust_weights: ${this.out_layer}:${n} pd_err:${pd_err} =`
                + ` err:${err} * output[${n}]:${output[n]} * (1.0 - output[${n}]:${output[n]}`);

            // Compute the sum of the square of the error and add to total_error
            let sse = 0.5 * err * err;
            dbg(`adjust_weights: ${this.out_layer}:${n} sse:${sse} =`
                + ` 0.5 * err:${err} * err:${err}`);
            let tmp = this.error;
            this.error = tmp + sse;
            dbg(`adjust_weights: ${this.out_layer}:${n} this.error:${this.error} =`
                + ` this.error:${tmp} + sse:${sse}`);
        }
        dbg(`adjust_weights: out_layer:${this.out_layer} this.error=${this.error}`);

        // For all of layers starting at the output layer back propagate the pd_error
        // to the previous layers. The output layers pd_error has been calculated above
        dbg("\nadjust_weights: backpropagate pd_error to hidden layers");
        let first_hidden_layer = 1;
        for (let l = this.out_layer; l > first_hidden_layer; l--) {
            let cur_layer = this.layers[l];
            let prev_layer = this.layers[l-1];
            dbg(`adjust_weights: cur_layer=${l} prev_layer=${l-1}`);

            // Compute the partial derivative of the error for the previous layer
            for (let npl = 0; npl < prev_layer.length; npl++) {
                let sum_weighted_pd_err = 0.0;
                for (let ncl = 0; ncl < cur_layer.length; ncl++) {
                    let pd_err = cur_layer[ncl].pd_error;
                    dbg(`adjust_weights: ${l}:${ncl} pd_err=${pd_err}`);
                    let weight = cur_layer[ncl].weights[npl+1];
                    dbg(`adjust_weights: ${l}:${ncl} weight:${weight} = cur_layer[${ncl}].weights[${npl+1}]`);
                    let tmp = sum_weighted_pd_err;
                    sum_weighted_pd_err = tmp + (pd_err * weight);
                    dbg(`adjust_weights: ${l}:${ncl} sum_weighted_pd_err:${sum_weighted_pd_err} =`
                        + ` ${tmp} + (pd_err:${pd_err} * weight:${weight})`);
                }

                let prev_out = prev_layer[npl].output;
                let pd_prev_out = prev_out * (1.0 - prev_out);
                dbg(`adjust_weights: prev_layer:${l-1}:${npl} pd_prev_out:${pd_prev_out} = `
                    + `prev_out:${prev_out} * (1.0 - prev_out:${prev_out})`);
                prev_layer[npl].pd_error = sum_weighted_pd_err * pd_prev_out;
                dbg(`adjust_weights: prev_layer:${l-1}:${npl} pd_error:${prev_layer[npl].pd_error} =`
                    + ` sum_weighted_pd_err:${sum_weighted_pd_err} * pd_prev_out:${pd_prev_out}`);
            }
        }

        // Update the weights for hidden layers and output layer
        dbg(`\nadjust_weights: update weights learning_rate=${this.learning_rate}`
            + ` momemutum_factor=${this.momentum_factor}`);
        for (let l = 1; l <= this.out_layer; l++) {
            let layer = this.layers[l];
            dbg(`adjust_weights: layers:${l} looping`);
            for (let n = 0; n < layer.length; n++) {
                let neuron = layer[n];
                let inputs = neuron.inputs;

                // The weights and mementums input entires at index 1,
                // the bias entries will be at index 0
                let weights = neuron.weights;
                let momentums = neuron.momentums;

                // Start with bias
                let pd_err = neuron.pd_error;

                // Update the weights for bias
                let momentum = this.momentum_factor * momentums[0];
                dbg(`adjust_weights: ${l}:${n} momentum:${momentum} =`
                    + ` this.momentum_factor:${this.momentum_factor} * momentums[0]:${momentums[0]}`);
                momentums[0] = (this.learning_rate * pd_err) + momentum;
                dbg(`adjust_weights: ${l}:${n} momentums[0]:${momentums[0]} =`
                    + ` (eta:${this.learning_rate} * pd_err:${pd_err}) + momentum:${momentum} bias`);

                let w = weights[0];
                weights[0] = weights[0] + momentums[0];
                dbg(`adjust_weights: ${l}:${n} weights[0]=${weights[0]} = `
                    + `weights[0]:${weights[0]} + momentums[0]:${momentums[0]} bias`);

                // Loop through this neurons input neurons adjusting the weights and momentums
                dbg(`adjust_weights: ${l}:${n} update weights pd_err=${pd_err}`);
                for (let i = 1; i <= neuron.inputs.length; i++) {
                    // Update the weights
                    let input = inputs[i-1].output;
                    momentum = this.momentum_factor * momentums[i];
                    momentums[i]  = (this.learning_rate * input * pd_err) + momentum;
                    dbg(`adjust_weights: ${l}:${n} momentums[${i}]:${momentums[i]} =`
                        + ` (eta:${this.learning_rate} * input:${input} pd_err:${pd_err}) + momentum:${momentum}`);

                    w = weights[i];
                    weights[i] = weights[i] + momentums[i];
                    dbg(`adjust_weights: ${l}:${n} weights[${i}]:${weights[i]} =`
                        + ` weights[${i}]:${weights[i]} + momentums[${i}]=${momentums[i]}`);
                }
            }
        }

        dbg(`adjust_weights:+ error=${this.error}`);
        return this.error;
    }
}
