const { TuringMachine } = require('../public/turing_machine.js');

describe('Turing Machine Tests', () => {
    describe('Single-Tape Turing Machine', () => {
        test('Basic test', () => {
            const tm = new TuringMachine(['q0', 'q1', 'q2'],
                ['0', '1'],
                {
                    q0: {
                        '0': {
                            nextState: 'q1',
                            transition: [{ writeSymbol: '1', moveDirection: 'R'}]
                        },
                        '1': {
                            nextState: 'q2',
                            transition: [{ writeSymbol: '0', moveDirection: 'R'}]
                        },
                        '_': {
                            nextState: 'q0',
                            transition: [{ writeSymbol: '0', moveDirection: 'R'}]
                        }
                    },
                    q1: {
                        '0': {
                            nextState: 'q0',
                            transition: [{ writeSymbol: '0', moveDirection: 'R'}]
                        },
                        '1': {
                            nextState: 'q2',
                            transition: [{ writeSymbol: '1', moveDirection: 'R'}]
                        },
                        '_': {
                            nextState: 'q2',
                            transition: [{ writeSymbol: '1', moveDirection: 'R'}]
                        }
                    }
                },
                'q0',
                ['q2'],
                1,
                [0]
            );
            tm.tapes[0] = ['0', '0', '0'];

            while (tm.step()) {}

            expect(tm.currentState).toBe('q2');
            expect(tm.isHalted()).toBe(true);
            expect(tm.isOverLimit()).toBe(false);
            expect(tm.tapes[0]).toStrictEqual(["1", "0", "1", "1", "_"]);
        });

        test('No halting', () => {
            const tm = new TuringMachine(['q0', 'q1', 'q2'],
                ['0', '1'],
                {
                    q0: {
                        '_': {
                            nextState: 'q1',
                            transition: [{ writeSymbol: '0', moveDirection: 'R'}]
                        }
                    },
                    q1: {
                        '_': {
                            nextState: 'q0',
                            transition: [{ writeSymbol: '1', moveDirection: 'R'}]
                        }
                    }
                },
                'q0',
                ['q2'],
                1,
                [0]
            );
            tm.tapes[0] = ['_'];

            while (tm.step()) {}

            expect(tm.currentState).toBe('q0');
            expect(tm.isHalted()).toBe(false);
            expect(tm.isOverLimit()).toBe(true);
        });
    });

    describe('Multi-Tape Turing Machine', () => {
        test('Invert concat', () => {
            const tm = new TuringMachine(['q0', 'q1', 'q2'],
                ['0', '1'],
                {
                    q0: {
                        '0,_': {
                            nextState: 'q0',
                            transition: [
                                { writeSymbol: '0', moveDirection: 'R'},
                                { writeSymbol: '1', moveDirection: 'R'}
                            ]
                        },
                        '1,_': {
                            nextState: 'q0',
                            transition: [
                                { writeSymbol: '1', moveDirection: 'R'},
                                { writeSymbol: '0', moveDirection: 'R'}
                            ]
                        },
                        '_,_': {
                            nextState: 'q1',
                            transition: [
                                { writeSymbol: '_', moveDirection: 'S'},
                                { writeSymbol: '_', moveDirection: 'L'}
                            ]
                        }
                    },
                    q1: {
                        '_,0': {
                            nextState: 'q1',
                            transition: [
                                { writeSymbol: '0', moveDirection: 'R'},
                                { writeSymbol: '_', moveDirection: 'L'}
                            ]
                        },
                        '_,1': {
                            nextState: 'q1',
                            transition: [
                                { writeSymbol: '1', moveDirection: 'R'},
                                { writeSymbol: '_', moveDirection: 'L'}
                            ]
                        },
                        '_,_': {
                            nextState: 'q2',
                            transition: [
                                { writeSymbol: '_', moveDirection: 'S'},
                                { writeSymbol: '_', moveDirection: 'S'}
                            ]
                        }
                    }
                },
                'q0',
                ['q2'],
                2,
                [0,0]
            );
            tm.tapes[0] = ['0', '1', '0'];
            tm.tapes[1] = ['_'];

            while (tm.step()) {}

            expect(tm.currentState).toBe('q2');
            expect(tm.isHalted()).toBe(true);
            expect(tm.isOverLimit()).toBe(false);
            expect(tm.tapes[0]).toStrictEqual(["0", "1", "0", "1", "0", "1", "_"]);
        });
    });
});
