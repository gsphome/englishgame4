import { ModalComponent } from './ModalComponent.js';

export class ExplanationModalComponent extends ModalComponent {
    constructor() {
        super('explanation-modal');
        this.setupListeners();
    }

    setupListeners() {
        const closeBtn = document.getElementById('close-explanation-modal-btn');
        if (closeBtn) {
            this.addListener(closeBtn, 'click', () => this.hide());
        }
    }

    show(wordData) {
        if (!this.element) return;
        
        document.getElementById('explanation-word').textContent = wordData.word || wordData.term;
        document.getElementById('explanation-word-translation').textContent = wordData.translation_es || wordData.term_es;
        document.getElementById('explanation-example-en').textContent = `"${wordData.example || wordData.explanation}"`;
        document.getElementById('explanation-example-es').textContent = `"${wordData.example_es || wordData.explanation_es}"`;
        
        super.show();
    }
}