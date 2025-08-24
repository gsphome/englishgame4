import { BaseComponent } from './BaseComponent.js';

export class ModalComponent extends BaseComponent {
    constructor(modalId) {
        super();
        this.modalId = modalId;
        this.element = document.getElementById(modalId);
    }

    toggle(show) {
        if (this.element) {
            this.element.classList.toggle('hidden', !show);
        }
    }

    show() {
        this.toggle(true);
    }

    hide() {
        this.toggle(false);
    }
}