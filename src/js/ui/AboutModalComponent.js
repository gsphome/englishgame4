import { ModalComponent } from './ModalComponent.js';
import { MESSAGES } from '../utils/i18n.js';

export class AboutModalComponent extends ModalComponent {
    constructor() {
        super('about-modal');
        this.setupListeners();
    }

    setupListeners() {
        const closeBtn = document.getElementById('close-about-modal-btn');
        if (closeBtn) {
            this.addListener(closeBtn, 'click', () => this.hide());
        }
        
        // Add keyboard listener for Enter key
        this.addListener(document, 'keydown', (e) => {
            if (this.element && !this.element.classList.contains('hidden') && e.key === 'Enter') {
                this.hide();
                e.preventDefault();
            }
        });
    }

    show() {
        this.updateText();
        super.show();
    }

    updateText() {
        if (!this.element) return;
        
        const titleEl = this.element.querySelector('[data-i18n="aboutTitle"]');
        const text1El = this.element.querySelector('[data-i18n="aboutText1"]');
        const text2El = this.element.querySelector('[data-i18n="aboutText2"]');
        const closeEl = this.element.querySelector('[data-i18n="closeButton"]');

        if (titleEl) titleEl.textContent = MESSAGES.get('aboutTitle');
        if (text1El) text1El.textContent = MESSAGES.get('aboutText1');
        if (text2El) text2El.textContent = MESSAGES.get('aboutText2');
        if (closeEl) closeEl.textContent = MESSAGES.get('closeButton');
    }
}