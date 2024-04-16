import { initCanvas, updateCanvas } from "./graphics.js";

var turingMachines = [];
var simulationStarted = false;

const startButton = document.getElementById('start-button');
const stepButton = document.getElementById('step-button');
const saveButton = document.getElementById('save-button');
const loadButton = document.getElementById('load-button');

const states = document.getElementById('states');
const alphabet = document.getElementById('alphabet');
const initialState = document.getElementById('initialState');
const finalStates = document.getElementById('finalStates');
const transitionFunctionText = document.getElementById('transitionFunctionText');
const tape = document.getElementById('tape');

function packageInitState() {
    const selectedMethod = document.querySelector('input[name="inputMethod"]:checked').value;
    var transitionFunctionStr;
    if (selectedMethod === "dropdowns") {
        transitionFunctionStr = parseTransitionFunction(stringifyTransitionFunction());
    }
    else {
        transitionFunctionStr = parseTransitionFunction(transitionFunctionText.value);
    }
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
    turingMachines.length = 0;
    
    var tmState = packageInitState();
    //console.log(tmState.states, tmState.alphabet, tmState.initState, tmState.finalStates, tmState.transFunct, tmState.tape);
    
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

saveButton.addEventListener('click', () => {
    saveConfiguration();
});

loadButton.addEventListener('click', () => {
    loadConfiguration();
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

document.addEventListener("DOMContentLoaded", function() {
    const inputMethodDropdowns = document.getElementById("transitionFunctionDropdowns");
    const inputMethodText = document.getElementById("transitionFunctionText");

    function toggleInputMethod() {
        const selectedMethod = document.querySelector('input[name="inputMethod"]:checked').value;
        if (selectedMethod === "dropdowns") {
            inputMethodDropdowns.style.display = "block";
            inputMethodText.style.display = "none";
        } else {
            inputMethodDropdowns.style.display = "none";
            inputMethodText.style.display = "block";
        }
    }

    const radioInputs = document.querySelectorAll('input[name="inputMethod"]');
    radioInputs.forEach(input => {
        input.addEventListener("change", toggleInputMethod);
    });

    toggleInputMethod();
    
    const addTransitionLineBtn = document.getElementById("addTransitionLineBtn");
    const transitionFunctionDiv = document.getElementById("transitionFunction");

    addTransitionLineBtn.addEventListener("click", function() {
        const transitionLineDiv = document.createElement("div");
        transitionLineDiv.classList.add("transition-line");

        transitionLineDiv.innerHTML = `
            <select class="from-state-select">
            </select>
            <select class="from-letter-select">
            </select>
            <select class="to-state-select">
            </select>
            <select class="to-letter-select">
            </select>
            <select class="move-direction-select">
                <option value="L">L</option>
                <option value="S">S</option>
                <option value="R">R</option>
            </select>
            <button type="button" class="remove-transition-line-btn">×</button>
        `;

        const states = document.getElementById("states").value.split(",");
        const alphabet = document.getElementById("alphabet").value.split(",");
        const fromStateSelect = transitionLineDiv.querySelector(".from-state-select");
        const toStateSelect = transitionLineDiv.querySelector(".to-state-select");
        const fromLetterSelect = transitionLineDiv.querySelector(".from-letter-select");
        const toLetterSelect = transitionLineDiv.querySelector(".to-letter-select");
        states.forEach(state => {
            const option1 = document.createElement("option");
            const option2 = document.createElement("option");
            option1.text = option2.text = state.trim();
            fromStateSelect.add(option1);
            toStateSelect.add(option2);
        });
        alphabet.forEach(letter => {
            const option1 = document.createElement("option");
            const option2 = document.createElement("option");
            option1.text = option2.text = letter.trim();
            fromLetterSelect.add(option1);
            toLetterSelect.add(option2);
        });

        addBlank(fromLetterSelect);
        addBlank(toLetterSelect);

        transitionFunctionDiv.appendChild(transitionLineDiv);
    });


    const statesInput = document.getElementById("states");
    const alphabetInput = document.getElementById("alphabet");

    document.addEventListener("click", function(event) {
        if (event.target && event.target.classList.contains("remove-transition-line-btn")) {
            event.target.parentElement.remove();
        }
    });

    statesInput.addEventListener("input", function() {
        const stateSelects = document.querySelectorAll(".from-state-select, .to-state-select");
        stateSelects.forEach(select => {
            updateSelectableList(statesInput, select);
        });
    });

    alphabetInput.addEventListener("input", function() {
        const letterSelects = document.querySelectorAll(".from-letter-select, .to-letter-select");
        letterSelects.forEach(select => {
            updateSelectableList(alphabetInput, select);
            addBlank(select);
        });
    });

    function updateSelectableList(input, selectElement) {
        const values = input.value.split(",").map(item => item.trim());
        selectElement.innerHTML = "";
        values.forEach(value => {
            const option = document.createElement("option");
            option.text = value;
            selectElement.add(option);
        });
    }
    
    function addBlank(letterSelect) {
        const blankOpt = document.createElement("option");
        blankOpt.text = "_";
        letterSelect.add(blankOpt);
    }
});

function stringifyTransitionFunction() {
    const transitionFunctionDiv = document.getElementById("transitionFunction");
    let transitionLines = "";
    const transitionLineElements = transitionFunctionDiv.querySelectorAll(".transition-line");
    transitionLineElements.forEach(line => {
        const fromStateSelect = line.querySelector(".from-state-select").value;
        const toStateSelect = line.querySelector(".to-state-select").value;
        const fromLetterSelect = line.querySelector(".from-letter-select").value;
        const toLetterSelect = line.querySelector(".to-letter-select").value;
        const moveDirectionSelect = line.querySelector(".move-direction-select").value;

        const transitionLine = fromStateSelect.concat(" ", fromLetterSelect, " ", toLetterSelect, " ", toStateSelect, " ", moveDirectionSelect);

        transitionLines = transitionLines.concat("\n", transitionLine);
    });

    return transitionLines;
}