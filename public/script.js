import { initCanvas, updateCanvas, updateCanvasSize } from "./graphics.js";

document.addEventListener("DOMContentLoaded", function() {
    var turingMachines = [];
    var simulationStarted = false;

    const logList = document.getElementById("log-list");
    let turingMachineStates = [];

    let timer = 0;

    const startButton = document.getElementById('start-button');
    const stepButton = document.getElementById('step-button');
    const saveButton = document.getElementById('save-button');
    const loadButton = document.getElementById('load-button');
    const playButton = document.getElementById('play-button');
    const wholeSimButton = document.getElementById('whole-simulation-button');
    const delLogButton = document.getElementById('delete-log-button');
    const delTransButton = document.getElementById('clear-transition-list-button');

    const speedLabel = document.getElementById('speed-label');
    const speedSlider = document.getElementById('step-speed');

    const states = document.getElementById('states');
    const alphabet = document.getElementById('alphabet');
    const initialState = document.getElementById('initial-state');
    const finalStates = document.getElementById('final-states');
    const transitionFunctionText = document.getElementById('transition-function-text');
    const tape = document.getElementById('tape');
    const numTapesSelect = document.getElementById("num-tapes");
    const numTapesSelectBtn = document.getElementById("confirm-tape-num-btn");
    var selectedTapeNum = numTapesSelect.value;

    const toggleIcon = document.getElementById('toggle-icon');
    const textFieldContainer = document.querySelector('.text-field-container');

    toggleIcon.addEventListener('click', function() {
        if (textFieldContainer.style.display === 'none') {
            textFieldContainer.style.display = 'block';
            updateCanvasSize(window.innerWidth / 1.5, window.innerHeight);
        } else {
            textFieldContainer.style.display = 'none';
            updateCanvasSize(window.innerWidth, window.innerHeight);
        }
    });

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
        var defTapeNum = selectedTapeNum;

        var defTapes = [];
        var defHeadPosis = [];
        
        for (var i = 0; i < defTapeNum; ++i) {
            defTapes[i] = ['_'];
            defHeadPosis[i] = 0;
        }
        if (defTape.length != 0) {
            defTapes[0] = defTape;
        }

        let turingMachineState = {
            states: defStates,
            alphabet: defAlphabet,
            transFunct: transitionFunctionStr,
            initState: defInitState,
            finalStates: defFinalStates,
            tapeNum: defTapeNum,
            tapes: defTapes,
            headPosis: defHeadPosis
        };

        return turingMachineState;
    }

    function startSimulation() {
        var tmState = packageInitState();

        loadNewState(tmState);
    }

    playButton.addEventListener("click", togglePlay);

    function togglePlay() {
        if (!simulationStarted) {
            timer = setInterval(step, speedSlider.value);
            playButton.textContent = "⏸";
        }
        else {
            clearInterval(timer);
            playButton.textContent = "⏵";
        }

        simulationStarted = !simulationStarted;
    }

    speedSlider.addEventListener("input", setSpeed);

    function setSpeed() {
        speedLabel.textContent = "Lépés sebessége: " + speedSlider.value + "ms";
        if (simulationStarted) {
            clearInterval(timer);
            timer = setInterval(step, speedSlider.value);
        }
    }
    
    wholeSimButton.addEventListener("click", wholeSimulation);

    function step() {
        var tm = turingMachines[0];

        
        if (tm.step()) {
            addStateEntry(tm.packageLogState());
            updateCanvas(tm.packageState());
        }
        else {
            const text = `Szalag: ${tm.tapes[0].join('')}\nTerminált: ${tm.isHalted()}`
            document.getElementById('result').innerText = text;
            if (tm.maxSteps != -1) {
                alert(text);
            }
            else {
                alert("A futás problémába ütközött, a gép nem megfelelően lett konfigurálva!");
            }
            if (simulationStarted) {
                togglePlay();
            }
            return;
        }

    }

    function loadNewState(tmState) {
        turingMachines.length = 0;

        var tm = new TuringMachine(
            tmState.states,
            tmState.alphabet,
            tmState.transFunct,
            tmState.initState,
            tmState.finalStates,
            tmState.tapeNum,
            tmState.headPosis
        );
        tm.tapes = tmState.tapes;
        turingMachines.push(tm);

        initCanvas(tmState);
    }

    startButton.addEventListener('click', () => {
        startSimulation();
    });

    stepButton.addEventListener('click', step);

    saveButton.addEventListener('click', () => {
        saveConfiguration();
    });

    loadButton.addEventListener('click', () => {
        loadConfiguration();
    });

    function wholeSimulation() {
        var tm = turingMachines[0];

        while (tm.step()) {}

        const text = `Szalag: ${tm.tapes[0].join('')}\nTerminált: ${tm.isHalted()}`
        document.getElementById('result').innerText = text;
        if (tm.maxSteps != -1) {
            alert(text);
        }
        else {
            alert("A futás problémába ütközött, a gép nem megfelelően lett konfigurálva!");
        }
    }

    function parseTransitionFunction(transitionFunctionStr) {
        const transitions = {};
        const lines = transitionFunctionStr.trim().split('\n');
        
        const tapeNum = parseInt(selectedTapeNum);

        if (lines.length == 0 || lines.length % 2 == 1) {
            alert("A delta függvény helytelenül lett megadva!");
            return {};
        }

        for (var i = 0; i < lines.length; i += 2) {
            const identifierLine = lines[i].trim().split(/\s+/);
            const fromState = identifierLine[0];
            const rule = lines[i + 1].trim().split(/\s+/);
            const toState = rule[0];

            identifierLine.shift();
            const identifier = identifierLine.join(',');

            if (!transitions[fromState]) {
                transitions[fromState] = {};
            }

            transitions[fromState][identifier] = {
                nextState: toState,
                transition: []
            };

            rule.shift();
            for (var j = 0; j < tapeNum; ++j) {
                const transitionRule = {
                    writeSymbol: rule[j],
                    moveDirection: rule[j + tapeNum]
                };

                transitions[fromState][identifier].transition.push(transitionRule);
            }
        }
        return transitions;
    }

    function saveConfiguration() {
        const configuration = {
            states: document.getElementById('states').value.split(','),
            startState: document.getElementById('initial-state').value,
            endState: document.getElementById('final-states').value.split(','),
            alphabet: document.getElementById('alphabet').value.split(','),
            transitionFunction: document.getElementById('transition-function-text').value
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
                try {
                    const json = reader.result;
                    const configuration = JSON.parse(json);
                    document.getElementById('states').value = configuration.states.join(',');
                    document.getElementById('initial-state').value = configuration.startState;
                    document.getElementById('final-states').value = configuration.endState.join(',');
                    document.getElementById('alphabet').value = configuration.alphabet.join(',');
                    document.getElementById('transition-function-text').value = configuration.transitionFunction;
                }
                catch (error) {
                    console.error(error);
                    alert("A betöltés hibába ütközött. Ellenőrizze a helyes fájlformátumot!");
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    const inputMethodDropdowns = document.getElementById("transition-function-dropdowns");
    const inputMethodText = document.getElementById("transition-function-text");

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

    // ----------------------------------

    function addStateEntry(state) {
        let newState = structuredClone(state);
        turingMachineStates.push(newState);
        const listItem = document.createElement("li");
        listItem.textContent = state.tapes[0];

        const loadButton = document.createElement("button");
        loadButton.textContent = "Betöltés";
        loadButton.addEventListener("click", function() {
            loadNewState(newState);
        });

        listItem.appendChild(loadButton);
        logList.appendChild(listItem);
    }

    delLogButton.addEventListener("click", () => {
        logList.innerHTML = "";
    });


    const transitionList = document.getElementById("transition-list");
    const addTransitionBtn = document.getElementById("add-transition-btn");

    function addTransitionEntry() {
        const listItem = document.createElement("li");
        listItem.setAttribute("class", "transition-list-item")

        const fromStateSelect = createSelectInput("from-state", "from-state", states.value.split(','), false, false);
        const toStateSelect = createSelectInput("to-state", "to-state", states.value.split(','), false, false);

        const fromLettersSelects = [];
        const toLettersSelects = [];
        const moveDirectionSelects = [];

        const dirs = ['L', 'S', 'R'];

        const tapeNum = parseInt(selectedTapeNum);

        for (let i = 0; i < tapeNum; i++) {
            let needBr = i ===  tapeNum - 1;
            const fromLetterSelect = createSelectInput(`from-letter${i}`, "from-letter", alphabet.value.split(','), needBr, true);
            const toLetterSelect = createSelectInput(`to-letter${i}`, "to-letter", alphabet.value.split(','), false, true);
            const moveDirectionSelect = createSelectInput(`from-letter${i}`, "move-dir", dirs, needBr, false);
            fromLettersSelects.push(fromLetterSelect);
            toLettersSelects.push(toLetterSelect);
            moveDirectionSelects.push(moveDirectionSelect);
        }

        listItem.appendChild(fromStateSelect);
        fromLettersSelects.forEach(select => listItem.appendChild(select));
        listItem.appendChild(toStateSelect);
        toLettersSelects.forEach(select => listItem.appendChild(select));
        moveDirectionSelects.forEach(select => listItem.appendChild(select));

        transitionList.appendChild(listItem);

        const br = document.createElement("br");
        transitionList.appendChild(br);
    }

    function createSelectInput(id, className, options, br, needBlank) {
        const divElement = document.createElement("label");

        const selectElement = document.createElement("select");
        selectElement.setAttribute("id", id);
        selectElement.setAttribute("class", className);

        options.forEach(option => {
            const optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.textContent = option;

            selectElement.appendChild(optionElement);
        });

        if (needBlank) {
            addBlank(selectElement);
        }

        divElement.appendChild(selectElement);
        if (br) {
            const brElement = document.createElement("br");
            divElement.appendChild(brElement);
        }
        return divElement;
    }

    addTransitionBtn.addEventListener("click", addTransitionEntry);

    numTapesSelectBtn.addEventListener("click", setNumTapes);
    delTransButton.addEventListener("click", () => {
        transitionList.innerHTML = "";
    });

    function setNumTapes() {
        selectedTapeNum = numTapesSelect.value;
        transitionList.innerHTML = "";
        alert("A szalagszám mostantól a következő: " + numTapesSelect.value);
    }

    document.addEventListener("click", function(event) {
        if (event.target && event.target.classList.contains("remove-transition-line-btn")) {
            event.target.parentElement.remove();
        }
    });

    states.addEventListener("input", function() {
        const stateSelects = document.querySelectorAll("#from-state, #to-state");
        stateSelects.forEach(select => {
            updateSelectableList(states, select);
        });
    });

    alphabet.addEventListener("input", function() {
        const letterSelects = document.querySelectorAll(".from-letter, .to-letter");
        letterSelects.forEach(select => {
            updateSelectableList(alphabet, select);
            addBlank(select);
        });
    });

    function updateSelectableList(input, selectElement) {
        const values = input.value.split(",").map(item => item.trim());
        const selectedVal = selectElement.value;
        selectElement.innerHTML = "";
        values.forEach(value => {
            const option = document.createElement("option");
            option.text = value;
            selectElement.add(option);
        });
        selectElement.value = selectedVal;
    }

    function addBlank(select) {
        const blankOpt = document.createElement("option");
        blankOpt.value = "_";
        blankOpt.textContent = "_";
        select.appendChild(blankOpt);
    }
});

function stringifyTransitionFunction() {
    const transitionFunctionDiv = document.getElementById("transition-list");
    let transitionLines = "";
    const transitionLineElements = transitionFunctionDiv.querySelectorAll(".transition-list-item");
    transitionLineElements.forEach(line => {
        const fromStateSelect = line.querySelector("#from-state").value;
        const toStateSelect = line.querySelector("#to-state").value;
        
        const fromLetters = [];
        const fromLettersSelect = line.querySelectorAll(".from-letter");
        fromLettersSelect.forEach(letter => {
            fromLetters.push(letter.value);
        });

        const toLetters = [];
        const toLettersSelect = line.querySelectorAll(".to-letter");
        toLettersSelect.forEach(letter => {
            toLetters.push(letter.value);
        });

        const moveDirs = [];
        const moveDirSelect = line.querySelectorAll(".move-dir");
        moveDirSelect.forEach(dir => {
            moveDirs.push(dir.value);
        });

        const transitionLine = fromStateSelect.concat(" ", fromLetters.join(' '), "\n", toStateSelect, " ", toLetters.join(' '), " ", moveDirs.join(' '));

        transitionLines = transitionLines.concat("\n", transitionLine);
    });

    return transitionLines;
}