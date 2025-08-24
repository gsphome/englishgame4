// src/js/ui/ModalManager.js
import { BaseComponent } from './BaseComponent.js';
import { MESSAGES } from '../utils/i18n.js';

export class ModalManager extends BaseComponent {
    constructor() {
        super('#confirmation-modal');
        this.yesButton = document.getElementById('confirm-yes');
        this.noButton = document.getElementById('confirm-no');
        this.messageElement = document.getElementById('confirmation-message');
        this.init();
    }

    init() {
        if (this.yesButton) {
            this.addListener(this.yesButton, 'click', () => {
                this.onConfirm?.();
                this.hide();
            });
        }
        if (this.noButton) {
            this.addListener(this.noButton, 'click', () => {
                this.onCancel?.();
                this.hide();
            });
        }
        MESSAGES.addListener(() => this.updateText());
    }

    showConfirmation(message, onConfirm, onCancel) {
        this.messageElement.textContent = message;
        this.onConfirm = onConfirm;
        this.onCancel = onCancel;
        this.show();
    }

    updateText() {
        if (this.yesButton) this.yesButton.textContent = MESSAGES.get('yesButton');
        if (this.noButton) this.noButton.textContent = MESSAGES.get('noButton');
    }
}