class TuringMachine {
    constructor(states, alphabet, transitionFunction, initialState, finalStates) {
        this.states = states;
        this.alphabet = alphabet;
        this.transitionFunction = transitionFunction;
        this.currentState = initialState;
        this.finalStates = finalStates;
        this.tape = ['_'];
        this.headPosition = 0;
    }

    step() {
        console.log("LEEEE");
        console.log(this.states, this.alphabet, this.currentState, this.finalStates, this.transitionFunction, this.tape);

        const currentSymbol = this.tape[this.headPosition];
        const transition = this.transitionFunction[this.currentState][currentSymbol];
        if (transition) {
            this.tape[this.headPosition] = transition.writeSymbol;
            this.currentState = transition.nextState;
            this.headPosition += transition.moveDirection === 'R' ? 1 : -1;
            if (this.headPosition < 0) {
                this.tape.unshift('_');
                this.headPosition = 0;
            } else if (this.headPosition >= this.tape.length) {
                this.tape.push('_');
            }
            return true;
        } else {
            return false;
        }
    }

    isHalted() {
        return this.finalStates.includes(this.currentState);
    }
}

module.exports = TuringMachine;