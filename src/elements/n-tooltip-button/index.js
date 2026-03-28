export class TooltipButton extends HTMLButtonElement {
    static #isDefined = false;

    static register() {
        if (TooltipButton.#isDefined) return;
        customElements.define('n-tooltip-button', TooltipButton, { extends: 'button' });
        TooltipButton.#isDefined = true;
    }

    #clickHandler = () => {
        const text = this.getAttribute('tooltip');
        const popup = document.getElementById('tooltip-popup');
        if (popup && text) popup.show(text);
    }

    connectedCallback() {
        this.addEventListener('click', this.#clickHandler);
    }
}
