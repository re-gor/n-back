import {Storage} from '../../utils/storage.js';

const {isVibrationEnabled} = Storage.getAppSettings();

export class Button extends HTMLButtonElement {
    static #isDefined = false;
    static #defaultVibration = [60];
    static #defaultDisableVibration = [60, 30, 60];

    vibration
    disableVibration
    #connected = false;

    static register() {
        if (Button.#isDefined) {
            return;
        }

        customElements.define('n-button', Button, { extends: 'button' });
        Button.#isDefined = true;

    }
    
    #readAttributes() {
        const _vibration = this.getAttribute('vibration');
        if (_vibration) {
            this.vibration = _vibration.split(' ').map(Number);
        }
        
        const _disableVibration = this.getAttribute('disable-vibration');
        if (_disableVibration) {
            this.disableVibration = _disableVibration.split(' ').map(Number);        
        }
    }
    
    #clickHandler = (event) => {
        if (navigator.vibrate) {
            if (this.disabled) {
                navigator.vibrate(this.disableVibration);
                console.log('disble bipping', this.disableVibration)
            } else {
                navigator.vibrate(this.vibration);
                console.log('bipping', this.vibration)
            }
        }

        if (event.target.classList.contains('disable-overlay') && event.target.parentNode.disabled) {
            event.stopPropagation();
        }
    }
    
    #bindEventListeners() {
        if (isVibrationEnabled) {
            this.#readAttributes();
            this.addEventListener('click', this.#clickHandler);
            this.querySelector('.disable-overlay').addEventListener('click', this.#clickHandler);
        }
    }

    connectedCallback() {
        this.vibration = Button.#defaultVibration;
        this.disableVibration = Button.#defaultDisableVibration;
        
        const overlay = document.createElement('span');
        overlay.classList.add('disable-overlay');
        this.appendChild(overlay);

        this.#bindEventListeners();
        this.#connected = true;
    }

    static get observedAttributes() {
        return ['vibration', 'disable-vibration'];
    }

    attributeChangedCallback() {
        if (this.#connected) {
            this.removeEventListener('click', this.#clickHandler);
            this.#bindEventListeners();
        }
    }
}