import { initCanvas, updateCanvas } from "./graphics.js";

var turingMachines = [];
var simulationStarted = false;

const startButton = document.getElementById('start-button');
const stepButton = document.getElementById('step-button');

const states = document.getElementById('states');
const alphabet = document.getElementById('alphabet');
const initialState = document.getElementById('initialState');
const finalStates = document.getElementById('finalStates');
const transitionFunction = document.getElementById('transitionFunction');
const tape = document.getElementById('tape');

function packageInitState() {
    var transitionFunctionStr = parseTransitionFunction(transitionFunction.value);
    var defStates = states.value.split(',');
    var defInitState = initialState.value;
    var defFinalStates = finalStates.value.split(',');
    var defTape = tape.value.split('');
    var defAlphabet = alphabet.value.split(',');

    let turingMachineState = {
        states: defStates,
        alphabet: defAlphabet,
        transFunct: transitionFunctionStr,
        initState: defInitState,
        finalStates: defFinalStates,
        tape: defTape
    };

    return turingMachineState;
}

function startSimulation() {

    //console.log(states, alphabet, initialState, finalStates, transitionFunction, tape);

    turingMachines.length = 0;

    var tmState = packageInitState();

    var tm = new TuringMachine(
        tmState.states,
        tmState.alphabet,
        tmState.transFunct,
        tmState.initState,
        tmState.finalStates
    );
    tm.tape = tmState.tape;
    turingMachines.push(tm);
    simulationStarted = true;

    initCanvas(tmState);
    
    //wholeSimulation();
}

startButton.addEventListener('click', () => {
    startSimulation();
});

stepButton.addEventListener('click', () => {
    var tm = turingMachines[0];

    tm.step();

    if (tm.isHalted() || tm.isOverLimit()) {
        document.getElementById('result').innerText = `Szalag: ${tm.tape.join('')}\nTerminált: ${tm.isHalted()}`;
        return;
    }

    updateCanvas(tm.packageState());
});

function wholeSimulation() {
    var tm = turingMachines[0];
    
    while (!tm.isHalted() && !tm.isOverLimit()) {
        tm.step();
    }
    document.getElementById('result').innerText = `Szalag: ${tm.tape.join('')}\nTerminált: ${tm.isHalted()}`;
}

function parseTransitionFunction(transitionFunctionStr) {
    const transitions = {};
    const lines = transitionFunctionStr.trim().split('\n');
    lines.forEach(line => {
        const [currentState, currentSymbol, writeSymbol, nextState, moveDirection] = line.trim().split(/\s+/);
        if (!transitions[currentState]) {
            transitions[currentState] = {};
        }
        transitions[currentState][currentSymbol] = {
            writeSymbol,
            nextState,
            moveDirection
        };
    });
    return transitions;
}

function saveConfiguration() {
    const configuration = {
        states: document.getElementById('states').value.split(','),
        startState: document.getElementById('initialState').value,
        endState: document.getElementById('finalStates').value.split(','),
        alphabet: document.getElementById('alphabet').value.split(','),
        startingTape: document.getElementById('tape').value,
        transitionFunction: document.getElementById('transitionFunction').value
    };

    const json = JSON.stringify(configuration, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'turing_machine_configuration.json';
    a.click();

    URL.revokeObjectURL(url);
}

function loadConfiguration() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = function(event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function() {
            const json = reader.result;
            const configuration = JSON.parse(json);

            document.getElementById('states').value = configuration.states.join(',');
            document.getElementById('initialState').value = configuration.startState;
            document.getElementById('finalStates').value = configuration.endState.join(',');
            document.getElementById('alphabet').value = configuration.alphabet.join(',');
            document.getElementById('tape').value = configuration.startingTape;
            document.getElementById('transitionFunction').value = configuration.transitionFunction;
        };

        reader.readAsText(file);
    };

    input.click();
}