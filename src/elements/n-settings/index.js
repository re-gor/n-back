import { importTemplate } from "../../utils/loadHtml.js";
import { ServiceWorkerUtility } from "../../utils/serviceWorker.js";
import { Storage } from "../../utils/storage.js";

const {isEnabled: isSwEnabled} = Storage.getServiceWorkerSettings();
const {isVibrationEnabled} = Storage.getAppSettings();
const template = await importTemplate(import.meta.url, {props: {
    swAction: isSwEnabled ? 'Disable' : 'Enable',
    vibAction: isVibrationEnabled ? 'Disable' : 'Enable',
}});

export class Settings extends HTMLDivElement {
    static #isDefined = false
    static register() {
        if (Settings.#isDefined) {
            return;
        }

        customElements.define('n-settings', Settings, {extends: 'div'});
        Settings.#isDefined = true;
    }

    #prepareCleanProgressButton() {
        this.shadowRoot.querySelector('.settings__clean-stat').addEventListener('click', () => {
            const answer = prompt('Warning! Do you really want to eliminate all your game log? Print "Yes" if it so');
            
            if (answer.toLowerCase() === 'yes') {
                Storage.cleanGameLog();

                this.dispatchEvent(new Event('statCleaned'));
            }
        });
    }

    #prepareOfflineToggler() {
        this.shadowRoot.querySelector('.settings__offline-toggler').addEventListener('click', event => {
            const {isEnabled: isSwEnabled} = Storage.getServiceWorkerSettings();

            if (isSwEnabled) {
                Storage.setServiceWorkerIsEnabled(false);
                ServiceWorkerUtility.uninstall();
                event.target.innerText = 'Enable offline mode';
            } else {
                Storage.setServiceWorkerIsEnabled(true);
                ServiceWorkerUtility.register();
                event.target.innerText = 'Disable offline mode';
            }
        })
    }

    #prepareVibrationToggler() {
        this.shadowRoot.querySelector('.settings__vibration-toggler').addEventListener('click', event => {
            const {isVibrationEnabled} = Storage.getAppSettings();

            if (isVibrationEnabled) {
                Storage.setVibration(false);
                event.target.innerText = 'Enable vibration (will be applied after reload)';
            } else {
                Storage.setVibration(true);
                event.target.innerText = 'Disable vibration (will be applied after reload)';
            }
        })
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.cloneNode(true));

        this.#prepareCleanProgressButton();
        this.#prepareOfflineToggler();
        this.#prepareVibrationToggler();
        this.shadowRoot
            .querySelector('.settings__reload-assets')
            .addEventListener('click', () => this.dispatchEvent(new Event('reloadAssets')));
        this.shadowRoot
            .querySelector('.settings__drop-game-settings')
            .addEventListener('click', () => {
                Storage.cleanGameSettings();
                this.dispatchEvent(new Event('gameSettingsCleaned'));
            });
    }
}
