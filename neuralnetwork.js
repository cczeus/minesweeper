class NeuralNetwork {

    // input is the number of inputs
    // layers is an array of number of nodes in each layer
    constructor() {
        // this.inputLength = input;
        // this.layers = layers;
        // this.learningRate = learningRate;
        // 0-8 value, 9 is visible, 10 is in board, all mutually exclusive SHOULD THEY BE A DIFFERENT INPUT OR ??
        this.input = tf.input({shape: [24 * 11]});
        this.hidden = tf.layers.dense({units: 256, activation: 'sigmoid'});
        this.output = tf.layers.dense({units: 1, activation: 'sigmoid'}).apply(this.hidden.apply(this.input));
        this.model = tf.model({inputs: this.input, outputs: this.output});
    }

    // Fix memory leak
    predict(input) {
        return tf.tidy(() => {
            return this.model.predict(tf.tensor(input));
        });
    }

    getPredictionArray(input) {
        return tf.tidy(() => {
            return predict(input).dataSync()[0];
        });
    }

    train(data) {
        tf.tidy(() => {
            const optimizer = tf.train.sgd(0.01);
            const loss = (pred, label) => pred.sub(label).square().mean();
            for(let i = 0; i < data[0].length; i++) {
                optimizer.minimize(() => loss(this.predict(data[0][i]), tf.tensor(data[1][i])));
            }
        });
    }
}