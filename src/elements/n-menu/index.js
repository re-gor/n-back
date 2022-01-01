import { importTemplate } from "../../utils/loadHtml.js";

const template = await importTemplate(import.meta.url, {props: {}});

export class Menu extends HTMLDivElement {
    static #isDefined = false
    static register() {
        if (Menu.#isDefined) {
            return;
        }

        customElements.define('n-menu', Menu, {extends: 'div'});
        Menu.#isDefined = true;
    }

    connectedCallback() {
        this.attachShadow({mode: 'open'});
        this.shadowRoot.appendChild(template.cloneNode(true));

        this.shadowRoot
            .querySelector('.menu__play')
            .addEventListener('click', () => this.dispatchEvent(new Event('play')));
    }
}
