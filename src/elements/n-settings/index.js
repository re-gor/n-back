import { importTemplate } from "../../utils/loadHtml.js";
import { ServiceWorkerUtility } from "../../utils/serviceWorker.js";
import { Storage } from "../../utils/storage.js";

const {isEnabled: isSwEnabled} = Storage.getServiceWorkerSettings();
const template = await importTemplate(import.meta.url, {props: {
    swAction: isSwEnabled ? 'Disable' : 'Enable'
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
                Storage.disableServiceWorker();
                ServiceWorkerUtility.uninstall();
                event.target.innerText = 'Enable offline mode';
            } else {
                Storage.enableServiceWorker();
                ServiceWorkerUtility.register();
                event.target.innerText = 'Disable offline mode';
            }
        })
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.cloneNode(true));

        this.#prepareCleanProgressButton();
        this.#prepareOfflineToggler();
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
