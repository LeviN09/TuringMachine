function simulate() {
    const states = document.getElementById('states').value.split(',');
    const alphabet = document.getElementById('alphabet').value.split(',');
    const initialState = document.getElementById('initialState').value;
    const finalStates = document.getElementById('finalStates').value.split(',');
    const transitionFunction = parseTransitionFunction(document.getElementById('transitionFunction').value);
    const tape = document.getElementById('tape').value;


    console.log(states, alphabet, initialState, finalStates, transitionFunction, tape);

    fetch('/simulate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            states,
            alphabet,
            initialState,
            finalStates,
            transitionFunction,
            tape
        })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('result').innerText = `Szalag: ${data.tape}\nTerminált: ${data.halted}`;
    })
    .catch(error => console.error('Error:', error));
}

function parseTransitionFunction(transitionFunctionStr) {
    const transitions = {};
    const lines = transitionFunctionStr.trim().split('\n');
    lines.forEach(line => {
        console.log(line);
        const [currentState, currentSymbol, writeSymbol, nextState, moveDirection] = line.trim().split(/\s+/);
        console.log(currentState, currentSymbol, writeSymbol, nextState, moveDirection);
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
