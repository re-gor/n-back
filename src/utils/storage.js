import { SEQUENCE } from "../elements/n-game/index.js";

export class Storage {
    static #getItem(key, defaults) {
        let item = defaults;

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

    static getGameSettings() {
        return Storage.#getItem('gameSettings', {
            n: 1,
            probMulti: 0,
            turnTime: 5,
            length: 15,
            sequences: [SEQUENCE.POSITION, SEQUENCE.COLOR],
            showRightAnswers: false,
        });
    }

    static getServiceWorkerSettings() {
        return Storage.#getItem('swSettings', {
            isEnabled: true,
        });
    }

    static setServiceWorkerIsEnabled(isEnabled) {
        const settings = Storage.getServiceWorkerSettings();
        localStorage.setItem('swSettings', JSON.stringify({
            ...settings,
            isEnabled,
        }));
    }

    static getAppSettings() {
        return Storage.#getItem('settings', {
            isVibrationEnabled: true,
        });
    }

    static setVibration(isVibrationEnabled) {
        const settings = Storage.getAppSettings();
        localStorage.setItem('settings', JSON.stringify({
            ...settings,
            isVibrationEnabled,
        }));
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

    static cleanGameLog() {
        localStorage.setItem('gameLog', JSON.stringify({results: {}}));
    }

    static writeGameSettings(settings) {
        localStorage.setItem('gameSettings', JSON.stringify(settings));
    }

    static cleanGameSettings() {
        localStorage.removeItem('gameSettings');
    }
}


function getCurrentDateString() {
    const date = new Date();
    return `${date.getFullYear()}-${padRight(date.getMonth() + 1)}-${padRight(date.getDate())}`;
}

function padRight(str) {
    return String(str).length > 1 ? str : '0' + str;
}
