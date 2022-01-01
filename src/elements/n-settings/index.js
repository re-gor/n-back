import { importTemplate, importTemplateFromCache } from "../../utils/loadHtml.js";
import { Storage } from "../../utils/storage.js";

const template = await importTemplate(import.meta.url, {props: {}});

export class Settings extends HTMLDivElement {
    static #isDefined = false
    #settings = {}
    static register() {
        if (Settings.#isDefined) {
            return;
        }

        customElements.define('n-settings', Settings, {extends: 'div'});
        Settings.#isDefined = true;
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.cloneNode(true));  

        this.#settings = Storage.getSettings();

        Object.entries(this.#settings).forEach(([key, value]) => {
            const inputs = this.shadowRoot.querySelectorAll(`input[name=${key}`);

            if (inputs.length === 1) {
                const input = inputs[0];

                if (typeof value === 'boolean') {
                    input.checked = value;
                } else if (typeof value === 'number') {
                    input.value = value;
                }
            } else {
                inputs.forEach(input => {
                    const id = input.id.split('-')[1] || '';

                    if (value.includes(id.toUpperCase())) {
                        input.checked = true;
                    }
                })
            }
        });
    }

    getSettings() {
        const form = this.shadowRoot.querySelector('form');
        const formData = new FormData(form);

        return {
            n: Number(formData.get('n')),
            length: Number(formData.get('length')),
            turnTime: Number(formData.get('turnTime')),
            showRightAnswers: formData.get('showRightAnswers') === 'on',
            sequences: formData.getAll('sequences').filter(Boolean).map(s => s.toUpperCase()),
        }
    }

    saveSettings() {
        Storage.writeSettings(this.getSettings());
    }
}
