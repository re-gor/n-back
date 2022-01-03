import { importTemplate, importTemplateFromCache } from "../../utils/loadHtml.js";
import { Storage } from '../../utils/storage.js';

await importTemplate(import.meta.url, {props: {}});
await importTemplate(import.meta.url, {props: {}, path: './score.html'});

export const SEQUENCE = {
    POSITION: 'POSITION',
    COLOR: 'COLOR',
    LETTERS: 'LETTERS',
    DIGITS: 'DIGITS',
    AUDIO_LETTERS: 'AUDIO_LETTERS',
    AUDIO_DIGITS: 'AUDIO_DIGITS',
    AUDIO_COLOR: 'AUDIO_COLOR',
}

export class Game extends HTMLDivElement {
    #state = {}
    static #isDefined = false
    static #defaultSettings = {
        turnTime: 5, // sec
        length: 4, // actual length is length + N - 1;
        n: 1,
        showRightAnswers: false,
        sequences: [SEQUENCE.POSITION, SEQUENCE.COLOR, SEQUENCE.DIGITS]
    }

    static register() {
        if (Game.#isDefined) {
            return;
        }

        customElements.define('n-game', Game, { extends: 'div' });
        Game.#isDefined = true;
    }

    connectedCallback() {
        this.attachShadow({ mode: 'open' });
    }

    #makeGuess(sequenceName) {
        const seq = this.#state.sequences[sequenceName];

        if (seq[this.#state.iteration - this.#state.settings.n - 1] === seq[this.#state.iteration - 1]) {
            this.#state.userScore += 1;
        } else {
            this.#state.userScore -= 1
        }
    }

    #getButtonsRow() {
        return this.shadowRoot.querySelector('.game__buttons');
    }

    #setupButtons() {
        const buttons = this.#getButtonsRow();

        buttons.innerHTML = '';
        buttons.insertAdjacentHTML(
            'afterbegin',
            this.#state.settings.sequences.map((seq, idx) =>
                `<button type="button" data-sequence-name="${seq}" data-sequence-idx="${idx + 1}" disabled>${seq.toLowerCase()}</button>`
            ).join('')
        );
        buttons.addEventListener('click', this.#onButtonClick);
    }

    #onButtonClick = event => {
        if (event.target.nodeName === 'BUTTON' && event.target.dataset.sequenceName) {
            this.#makeGuess(event.target.dataset.sequenceName);

            event.target.disabled = true;
        }
    }

    #setupShortcuts() {
        window.addEventListener('keypress', this.#onShortcut);
    }

    #onShortcut = event => {
        if ('1' <= event.key && event.key <= '9') {
            const btn = this.#getButtonsRow().querySelector(`button[data-sequence-idx="${event.key}"]`);
            
            this.#makeGuess(btn.dataset.sequenceName);

            btn.disabled = true;
        }
    }

    #makeTurn() {
        const {
            iteration,
            settings,
            sequenceLength,
            sequences,
        } = this.#state;

        if (iteration >= settings.n) {
            this.#getButtonsRow().querySelectorAll('button').forEach(b => {
                b.disabled = false;

                if (settings.showRightAnswers) {
                    const seq = b.dataset.sequenceName;
                    if (sequences[seq][iteration - 1 - settings.n] === sequences[seq][iteration - 1]) {
                        b.classList.add('was-right');
                    }
                    setTimeout(() => b.classList.remove('was-right'), 400);
                }
            });
        }

        if (iteration === sequenceLength) {
            this.endGame();

            return;
        }

        const position = Array.isArray(sequences[SEQUENCE.POSITION]) ? sequences[SEQUENCE.POSITION][iteration] : 4;
        let classes = this.#state.commonClasses;
        let values = '';

        Object.entries(this.#state.sequences).forEach(([name, seq]) => {
            const isRight = iteration >= settings.n && seq[iteration - settings.n] === seq[iteration];

            this.#state.actualScore += Number(isRight);

            switch (name) {
                case SEQUENCE.COLOR:
                    classes += ` color_${seq[iteration]}`;
                    break;
                case SEQUENCE.LETTERS:
                case SEQUENCE.DIGITS:
                    values += seq[iteration];
                    break;
            }
        }, []);

        const value = this.shadowRoot.getElementById('game__current-value');
        const targetCell = this.shadowRoot.querySelector(`[data-cell-id="${position}"]`);

        if (!value) {
            targetCell.innerHTML = `<div class="${classes}" id="game__current-value">${values}</div>`;
        } else {
            value.className = classes;
            value.innerText = values;
            targetCell.appendChild(value);
        }

        ++this.#state.iteration;
    }

    #replay() {
        this.startGame(this.#state.settings);
    }

    startGame(_settings = {}) {
        const settings = {
            ...Game.#defaultSettings,
            ..._settings,
        };
        const sequenceLength = settings.length + settings.n;

        this.shadowRoot.innerHTML = '';
        this.shadowRoot.appendChild(
            importTemplateFromCache(
                import.meta.url, {
                    props: {
                        settings: {
                            n: settings.n,
                            sequences: settings.sequences.map(s => s.toLowerCase()).join(', '),
                            length: sequenceLength,
                            turnTime: `${settings.turnTime} sec`
                        }
                    }
                })
        );
        this.shadowRoot.querySelector('.game__replay').addEventListener('click', () => this.#replay());

        const commonClasses = settings.sequences.reduce((acc, sec) => {
            switch (sec) {
                case SEQUENCE.POSITION:
                    acc += ' position'
                    break;
                case SEQUENCE.COLOR:
                    acc += ' color';
                    break;
                case SEQUENCE.LETTERS:
                case SEQUENCE.DIGITS:
                    acc += ' char';
                    break;
            }

            return acc;
        }, 'item');

        this.#state = {
            isProperlyFinished: false,
            settings,
            sequenceLength,
            commonClasses,
            sequences: settings.sequences.reduce((acc, sec) => {
                acc[sec] = generateSequence(sec, sequenceLength);
                return acc;
            }, {}),
            iteration: 0,
            userScore: 0,
            actualScore: 0,
            intervalId: null,
        }

        this.#setupButtons();
        this.#setupShortcuts();

        setTimeout(() => {
            this.#makeTurn();

            this.#state.intervalId = setInterval(() => {
                if (this.#state.iteration === this.#state.sequenceLength) {
                    this.#killInterval();
                }
                this.#makeTurn();

            }, settings.turnTime * 1000);
        }, 2000);
    }

    #setupEndGame() {
        const screenSwitcher = this.shadowRoot.getElementById("game__screen");
        screenSwitcher.setActiveScreen('game-end');

        const scoreContainer = this.shadowRoot.querySelector('.game__end-score');
        scoreContainer.innerHTML = '';

        scoreContainer.appendChild(
            importTemplateFromCache(
                import.meta.url, {
                    props: {
                        userScore: this.#state.userScore,
                        actualScore: this.#state.actualScore,
                        score: this.#getScore(),
                    },
                    path: './score.html'
                })
        );
    }

    #killInterval() {
        if (this.#state.intervalId) {
            clearInterval(this.#state.intervalId);
            this.#state.intervalId = null;
        }
    }

    endGame() {
        if (!this.#state.isProperlyFinished && this.#state.sequenceLength && this.#state.iteration === this.#state.sequenceLength) {
            this.#state.isProperlyFinished = true;
            this.#logGame();
            this.dispatchEvent(new Event('gameEndedProperly'));

            this.#setupEndGame();
        }

        this.#killInterval();
        this.dispatchEvent(new Event('gameEnded'));
    }

    #getScore() {
        const {
            userScore,
            actualScore
        } = this.#state;

        if (userScore < 0) {
            return 0;
        }

        return actualScore ? Math.round(userScore * 100 / actualScore) : 100;
    }

    #logGame() {
        const score = this.#getScore();

        Storage.writeGame({
            score,
            settings: this.#state.settings,
        });
    }
}

function generateSequence(sec, len) {
    switch (sec) {
        case SEQUENCE.POSITION:
            return generateSequenceFromItems('012345678'.split('').map(Number), len);
        case SEQUENCE.LETTERS:
            // JKLMNOPQRSTUVWXYZ
            return generateSequenceFromItems('ABCDEFGHI'.split(''), len);
        case SEQUENCE.DIGITS:
            return generateSequenceFromItems('123456789'.split(''), len);
        case SEQUENCE.COLOR:
            return generateSequenceFromItems([
                'red',
                'green',
                'blue',
                'black',
                'yellow',
                'orange',
                'purple',
                'brown',
                'grey',
            ], len);
        default:
            throw new Error(`A sequence ${sec} is not supported`);
    }
}

function generateSequenceFromItems(items, len) {
    return (
        (new Array(len))
        .fill(null)
        .map(() => items[randomInt(items.length)])
    )
}

function randomInt(...args) {
    let start = 0;
    let end;

    if (!args.length) {
        throw new Error('There should be at least one argument in randomInt')
    } else if (args.length === 1) {
        end = args[0];
    } else if (args.length === 2) {
        start = args[0];
        end = args[1];
    }

    return Math.floor((end - start) * Math.random() + start);
}