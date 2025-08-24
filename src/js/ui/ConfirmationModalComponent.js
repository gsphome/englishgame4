import { ModalComponent } from './ModalComponent.js';
import { MESSAGES } from '../utils/i18n.js';

export class ConfirmationModalComponent extends ModalComponent {
    constructor(auth) {
        super('confirmation-modal');
        this.auth = auth;
        this.initElements();
        this.setupListeners();
    }

    initElements() {
        this.yesButton = document.getElementById('confirm-yes');
        this.noButton = document.getElementById('confirm-no');
        this.messageElement = document.getElementById('confirmation-message');
    }

    setupListeners() {
        if (this.yesButton) {
            this.addListener(this.yesButton, 'click', () => this.handleConfirm());
        }
        if (this.noButton) {
            this.addListener(this.noButton, 'click', () => this.handleCancel());
        }
    }

    handleConfirm() {
        this.auth.logout();
        this.hide();
    }

    handleCancel() {
        this.hide();
    }

    showLogoutConfirmation() {
        if (this.messageElement) {
            this.messageElement.textContent = MESSAGES.get('confirmLogoutMessage');
        }
        this.show();
    }

    updateText() {
        if (this.yesButton) {
            this.yesButton.textContent = MESSAGES.get('yesButton');
        }
        if (this.noButton) {
            this.noButton.textContent = MESSAGES.get('noButton');
        }
    }
}