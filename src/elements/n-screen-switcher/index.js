import { importTemplate, importTemplateFromCache } from '../../utils/loadHtml.js';

const template = await importTemplate(import.meta.url, {props: {}});
await importTemplate(import.meta.url, {path: './button.html'});

export class ScreenSwitcher extends HTMLDivElement {
    static #isDefined = false;
    #screens;
    #buttons;
    #activeScreenId = null; 

    static register() {
        if (!ScreenSwitcher.#isDefined) {
            customElements.define('n-screen-switcher', ScreenSwitcher, {extends: 'div'});
            ScreenSwitcher.#isDefined = true;
        }
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.cloneNode(true));

        this.#screens = this.querySelectorAll("[data-screen-id]");

        this.#screens[0].classList.add('active');
        this.#activeScreenId = this.#screens[0].dataset.screenId;
        this.#setupHeader();
    }

    #setupHeader() {
        const header = this.shadowRoot.querySelector('.screen-switcher__header');

        for (let s of this.#screens) {
            if (s.dataset.showInMenu) {
                const template = importTemplateFromCache(import.meta.url, {
                    path: './button.html',
                    props: {
                        disabled: this.#activeScreenId === s.dataset.screenId ? "disabled" : "",
                        text: s.dataset.showInMenu,
                        screenId: s.dataset.screenId,
                    }
                });

                header.append(template);
            }
        }

        this.#buttons = header.querySelectorAll('button');
        header.addEventListener('click', event => {
            if (event.target.nodeName === 'BUTTON' && event.target.dataset.linkedScreenId) {
                this.setActiveScreen(event.target.dataset.linkedScreenId);
            }
        });
    }


    setActiveScreen(id) {
        const prev = this.#activeScreenId;
        if (this.#activeScreenId === id) {
            return;
        }

        this.#activeScreenId = null;

        for (let s of this.#screens) {
            if (s.dataset.screenId === id) {
                s.classList.add('active');
                this.#activeScreenId = id;
                continue;
            }

            s.classList.remove('active');
        }

        for (let b of this.#buttons) {
            if (b.dataset.linkedScreenId === id) {
                b.disabled = true
                continue;
            }

            b.disabled = false;
        }

        const event = new Event('activeScreenSet');
        event.fromScreen = prev;
        event.toScreen = id;
        this.dispatchEvent(event)
    }

    clear() {
        this.innerHTML = '';
    }

    getActiveScreen() {
        return this.#activeScreenId;
    }
}
