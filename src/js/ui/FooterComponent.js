import { BaseComponent } from './BaseComponent.js';
import { MESSAGES } from '../utils/i18n.js';

export class FooterComponent extends BaseComponent {
    constructor() {
        super();
        this.footer = document.getElementById('main-footer-copyright');
        this.footerWebText = document.getElementById('footer-web-text');
        this.footerMobileText = document.getElementById('footer-mobile-text');
    }

    updateVisibility(currentView) {
        if (this.footer && this.footerWebText && this.footerMobileText) {
            if (currentView === 'menu') {
                this.show();
                this.updateText();
            } else {
                this.hide();
            }
        }
    }

    show() {
        if (this.footer) this.footer.style.display = 'block';
    }

    hide() {
        if (this.footer) this.footer.style.display = 'none';
    }

    updateText() {
        if (this.footerWebText) {
            this.footerWebText.textContent = MESSAGES.get('footerWeb');
        }
        if (this.footerMobileText) {
            this.footerMobileText.textContent = MESSAGES.get('footerMobile');
        }
    }
}