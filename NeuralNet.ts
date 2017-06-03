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

export class NeuralNet {

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
    // NeuronLayer* layers;
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

        dbg("ctor:-");
    }
}
