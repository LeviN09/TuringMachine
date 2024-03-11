const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;

const TuringMachine = require('./turing_machine');

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));


app.post('/simulate', (req, res) => {
    const { states, alphabet, initialState, finalStates, transitionFunction, tape } = req.body;

    const tm = new TuringMachine(
        states, 
        alphabet, 
        transitionFunction, 
        initialState, 
        finalStates
    );

    tm.tape = tape.split('');
    if (tm.tape.length == 0) {
        tm.tape.push('_');
    }

    var maxSteps = 1000;

    while (!tm.isHalted() && maxSteps > 0) {
        tm.step();
        maxSteps--;
    }

    res.send({
        tape: tm.tape.join(''),
        halted: tm.isHalted()
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});