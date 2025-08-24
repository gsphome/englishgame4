// Base class for all UI components
export class BaseComponent {
    constructor() {
        this.element = null;
        this.listeners = [];
    }

    createElement(tag, className = '', innerHTML = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    }

    addListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.listeners.push({ element, event, handler });
    }

    removeAllListeners() {
        this.listeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.listeners = [];
    }

    show() {
        if (this.element) this.element.classList.remove('hidden');
    }

    hide() {
        if (this.element) this.element.classList.add('hidden');
    }

    destroy() {
        this.removeAllListeners();
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}