class TuringMachine {
    constructor(states, alphabet, transitionFunction, initialState, finalStates) {
        this.states = states;
        this.alphabet = alphabet;
        this.transitionFunction = transitionFunction;
        this.currentState = initialState;
        this.finalStates = finalStates;
        this.tape = ['_'];
        this.headPosition = 0;
        this.lastMove = 'S';
        this.lastWritten = '';
        this.maxSteps = 1000;
    }

    step() {
        this.maxSteps -= 1;
        //console.log(this.states, this.alphabet, this.currentState, this.finalStates, this.transitionFunction, this.tape);

        const currentSymbol = this.tape[this.headPosition];
        const transition = this.transitionFunction[this.currentState][currentSymbol];
        if (transition) {
            this.tape[this.headPosition] = transition.writeSymbol;
            this.lastWritten = transition.writeSymbol;
            this.currentState = transition.nextState;
            if (transition.moveDirection === 'R') {
                this.headPosition += 1;
                this.lastMove = 'R';
            }
            else if (transition.moveDirection === 'L') {
                this.headPosition -= 1;
                this.lastMove = 'L';
            }
            else {
                this.lastMove = 'S';
            }

            if (this.headPosition < 0) {
                this.tape.unshift('_');
                this.headPosition = 0;
            } else if (this.headPosition >= this.tape.length) {
                this.tape.push('_');
            }
            return true;
        }
        else {
            return false;
        }
    }

    packageState() {
        let turingMachineState = {
            currState: this.currentState,
            tape: this.tape,
            headPos: this.headPosition,
            lastMove: this.lastMove,
            lastWritten: this.lastWritten
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