class TuringMachine {
    constructor(states, alphabet, transitionFunction, initialState, finalStates, tapeNum, headPositions) {
        this.states = states;
        this.alphabet = alphabet;
        this.transitionFunction = transitionFunction;
        this.currentState = initialState;
        this.finalStates = finalStates;
        this.tapeNum = tapeNum;
        this.tapes = [];
        this.headPositions = headPositions;
        this.lastWrittens = [];
        this.lastMoves = [];
        this.initTapes(tapeNum);
        this.tape = ['_'];
        this.maxSteps = 1000;
    }

    initTapes(tapeNum) {
        for (let i = 0; i < tapeNum; ++i) {
            this.tapes[i] = ['_'];
            this.lastWrittens[i] = '';
            this.lastMoves[i] = 'S';
        }
    }

    getLetterIdentifier() {
        const letters = [];

        for (var i = 0; i < this.tapeNum; ++i) {
            letters.push(this.tapes[i][this.headPositions[i]]);
        }

        return letters;
    }

    step() {
        this.maxSteps -= 1;
        const id = structuredClone(this.getLetterIdentifier()).join(',');
        const transition = this.transitionFunction[this.currentState][id];

        console.log(transition, "trans", id);
        if (!transition) {
            return false;
        }
        
        for (var i = 0; i < this.tapeNum; ++i) {
            this.tapes[i][this.headPositions[i]] = transition.transition[i].writeSymbol;
            this.lastWrittens[i] = transition.transition[i].writeSymbol;
            if (transition.transition[i].moveDirection === 'R') {
                this.headPositions[i] += 1;
                this.lastMoves[i] = 'R';
            }
            else if (transition.transition[i].moveDirection === 'L') {
                this.headPositions[i] -= 1;
                this.lastMoves[i] = 'L';
            }
            else {
                this.lastMoves[i] = 'S';
            }
            if (this.headPositions[i] < 0) {
                this.tapes[i].unshift('_');
                this.headPositions[i] = 0;
            }
            else if (this.headPositions[i] >= this.tapes[i].length) {
                this.tapes[i].push('_');
            }
            //console.log(i, this.tapes[i]);
        }
        this.currentState = transition.nextState;
        console.log("really?", this.tapes);
        return true;
    }

    packageState() {
        let turingMachineState = {
            currState: this.currentState,
            tapes: this.tapes,
            tapeNum: this.tapeNum,
            headPosis: this.headPositions,
            lastWrittens: this.lastWrittens,
            lastMoves: this.lastMoves
        }
        //console.log(turingMachineState);
        return turingMachineState;
    }

    packageLogState() {
        let turingMachineState = {
            states: this.states,
            alphabet: this.alphabet,
            transFunct: this.transitionFunction,
            initState: this.currentState,
            finalStates: this.finalStates,
            tapeNum: this.tapeNum,
            tapes: this.tapes,
            headPosis: this.headPositions,
            lastWrittens: this.lastWrittens,
            lastMoves: this.lastMoves
        }

        return turingMachineState;
    }

    isHalted() {
        return this.finalStates.includes(this.currentState);
    }

    isOverLimit() {
        return this.maxSteps <= 0;
    }
}