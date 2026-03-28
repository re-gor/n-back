export class TooltipPopup extends HTMLDivElement {
    static #isDefined = false;
    #text;
    #close;

    static register() {
        if (TooltipPopup.#isDefined) return;
        customElements.define('n-tooltip-popup', TooltipPopup, { extends: 'div' });
        TooltipPopup.#isDefined = true;
    }

    connectedCallback() {
        this.classList.add('tooltip-popup');

        this.#text = document.createElement('span');
        this.#text.classList.add('tooltip-popup__text');

        this.#close = document.createElement('button');
        this.#close.classList.add('tooltip-popup__close');
        this.#close.textContent = '×';
        this.#close.addEventListener('click', () => this.hide());

        this.appendChild(this.#text);
        this.appendChild(this.#close);

        this.hide();
    }

    show(text) {
        this.#text.textContent = text;
        clearTimeout(this.timer);
        this.timer = setTimeout(() => this.hide(), 10000);
        this.removeAttribute('hidden');
    }

    hide() {
        clearTimeout(this.timer);
        this.setAttribute('hidden', '');
    }
}
