import { SEQUENCE } from "../elements/n-game/index.js";

export class Storage {
    static #getItem(key, defaults) {
        let item = defaults

        try {
            const raw = localStorage.getItem(key);
            
            if (raw) {
                item = JSON.parse(raw);
            }
        } catch(e) {
            console.error('Fatal error during loading log', e);
        }

        return item;
    }

    static getLog() {
        return Storage.#getItem('gameLog', {results: {}});
    }

    static getSettings() {
        return Storage.#getItem('settings', {
            n: 1,
            turnTime: 5,
            length: 15,
            sequences: [SEQUENCE.POSITION, SEQUENCE.COLOR],
            showRightAnswers: false,
        });
    }

    static writeGame(game) {
        const log = this.getLog();

        const currDate = getCurrentDateString();

        if (!log.results[currDate]) {
            log.results[currDate] = [];
        }

        log.results[currDate].push(game);

        localStorage.setItem('gameLog', JSON.stringify(log));
    }

    static writeSettings(settings) {
        localStorage.setItem('settings', JSON.stringify(settings));
    }
}


function getCurrentDateString() {
    const date = new Date();
    return `${date.getFullYear()}-${padRight(date.getMonth() + 1)}-${padRight(date.getDate())}`;
}

function padRight(str) {
    return String(str).length > 1 ? str : '0' + str;
}
