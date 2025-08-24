import { ModalComponent } from './ModalComponent.js';
import { MESSAGES } from '../utils/i18n.js';
import { settingsManager } from '../managers/settingsManager.js';

export class SettingsModalComponent extends ModalComponent {
    constructor() {
        super('settings-modal');
        this.formContainer = document.getElementById('settings-form-container');
        this.saveBtn = document.getElementById('settings-save-btn');
        this.closeBtn = document.getElementById('settings-close-btn');
        this.editBtn = document.getElementById('settings-edit-btn');
        this.isEditMode = false;
        this.isRendering = false;
        this.modalTitle = this.element.querySelector('h2[data-i18n="settingsTitle"]');
        this.setupListeners();
        
        // Add i18n listener for modal title
        MESSAGES.addListener(() => this.updateModalTitle());
    }

    setupListeners() {
        if (this.closeBtn) {
            this.addListener(this.closeBtn, 'click', () => this.hide());
        }
        if (this.saveBtn) {
            this.addListener(this.saveBtn, 'click', () => this.handleSave());
        }
        if (this.editBtn) {
            this.addListener(this.editBtn, 'click', () => this.toggleEditMode());
        }
        
        // Initialize keyboard handler
        this.keyboardHandler = (e) => {
            if (this.element && !this.element.classList.contains('hidden') && e.key === 'Enter') {
                this.hide();
                e.preventDefault();
            }
        };
    }

    show() {
        this.isEditMode = false;
        // Add Enter listener for view mode
        document.addEventListener('keydown', this.keyboardHandler);
        this.renderForm();
        this.updateText();
        super.show();
    }

    async handleSave() {
        try {
            // Visual feedback
            this.saveBtn.textContent = MESSAGES.get('saving') || 'Saving...';
            this.saveBtn.disabled = true;
            
            const formData = this.getFormData();
            await this.applyChanges(formData);
            
            // Success feedback
            this.saveBtn.textContent = MESSAGES.get('saved') || 'Saved!';
            this.saveBtn.className = 'bg-green-600 text-white font-bold py-2 px-4 rounded';
            
            setTimeout(() => {
                this.hide();
                this.resetSaveButton();
            }, 1000);
            
        } catch (error) {
            console.error('Error saving settings:', error);
            this.saveBtn.textContent = MESSAGES.get('errorSaving') || 'Error!';
            this.saveBtn.className = 'bg-red-600 text-white font-bold py-2 px-4 rounded';
            
            setTimeout(() => {
                this.resetSaveButton();
            }, 2000);
        }
    }

    resetSaveButton() {
        this.saveBtn.textContent = MESSAGES.get('saveButton');
        this.saveBtn.className = 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200';
        this.saveBtn.disabled = false;
    }

    renderForm() {
        if (!this.formContainer || this.isRendering) return;
        
        this.isRendering = true;
        
        // Clear container completely
        this.formContainer.innerHTML = '';
        
        const settings = settingsManager.settings;

        this.createGroupTitle('General');
        this.currentGroupContainer = this.createGroupContainer();

        this.buildForm(settings);
        
        this.isRendering = false;
    }

    buildForm(obj, prefix = '') {
        // Define order for learningSettings properties (exclude categories)
        const learningOrder = ['flashcardMode', 'quizMode', 'completionMode', 'sortingMode', 'matchingMode'];
        // Define order for root level properties
        const rootOrder = ['defaultLanguage', 'level', 'learningSettings'];
        // Handle categories separately in learningSettings
        
        let keys = Object.keys(obj);
        
        // Sort keys if we're in learningSettings
        if (prefix === 'learningSettings') {
            keys = keys.sort((a, b) => {
                const aIndex = learningOrder.indexOf(a);
                const bIndex = learningOrder.indexOf(b);
                if (aIndex === -1 && bIndex === -1) return 0;
                if (aIndex === -1) return 1;
                if (bIndex === -1) return -1;
                return aIndex - bIndex;
            });
        } else if (prefix === '') {
            // Sort root level keys
            keys = keys.sort((a, b) => {
                const aIndex = rootOrder.indexOf(a);
                const bIndex = rootOrder.indexOf(b);
                if (aIndex === -1 && bIndex === -1) return 0;
                if (aIndex === -1) return 1;
                if (bIndex === -1) return -1;
                return aIndex - bIndex;
            });
        }
        
        for (const key of keys) {
            const keyPath = prefix ? `${prefix}.${key}` : key;
            
            if (Array.isArray(obj[key])) {
                // Skip categories array in learningSettings as it's handled separately
                if (keyPath === 'learningSettings.categories') {
                    continue;
                }
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                if (keyPath === 'learningSettings') {
                    // Add categories first in learningSettings but show in General group
                    if (obj[key].categories) {
                        this.createCategoriesSelect('learningSettings.categories', obj[key].categories);
                    }
                    this.createGroupTitle('Items');
                    this.currentGroupContainer = this.createGroupContainer();
                }
                this.buildForm(obj[key], keyPath);
            } else {
                this.createInputField(keyPath, obj[key]);
            }
        }
    }

    createInputField(keyPath, value) {
        const settingRow = document.createElement('div');
        settingRow.className = 'flex justify-between items-center py-1';

        const label = document.createElement('label');
        label.className = 'text-gray-600 text-xs flex-1';
        label.textContent = MESSAGES.get(this.keyPathToI18nKey(keyPath));
        settingRow.appendChild(label);

        let inputElement;
        if (keyPath === 'defaultLanguage') {
            inputElement = this.createLanguageSelect(value, keyPath);
        } else if (keyPath === 'level') {
            inputElement = this.createLevelSelect(value, keyPath);
        } else if (typeof value === 'number') {
            inputElement = this.createNumberInput(value, keyPath);
        } else {
            inputElement = this.createTextInput(value, keyPath);
        }
        
        inputElement.disabled = !this.isEditMode;
        settingRow.appendChild(inputElement);
        (this.currentGroupContainer || this.formContainer).appendChild(settingRow);
    }

    createLanguageSelect(value, keyPath) {
        const select = document.createElement('select');
        select.className = 'border border-gray-300 rounded px-2 py-1 text-xs w-28 text-center focus:ring-1 focus:ring-blue-400';
        select.dataset.keyPath = keyPath;
        
        const enOption = document.createElement('option');
        enOption.value = 'en';
        enOption.textContent = '🇬🇧 English';
        select.appendChild(enOption);
        
        const esOption = document.createElement('option');
        esOption.value = 'es';
        esOption.textContent = '🇪🇸 Español';
        select.appendChild(esOption);
        
        select.value = value;
        select.disabled = !this.isEditMode;
        return select;
    }

    createLevelSelect(value, keyPath) {
        const select = document.createElement('select');
        select.className = 'border border-gray-300 rounded px-2 py-1 text-xs w-28 text-center focus:ring-1 focus:ring-blue-400';
        select.dataset.keyPath = keyPath;
        
        const levels = ['all', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
        levels.forEach(level => {
            const option = document.createElement('option');
            option.value = level;
            option.textContent = level === 'all' ? 'All' : level.toUpperCase();
            select.appendChild(option);
        });
        
        select.value = value;
        select.disabled = !this.isEditMode;
        return select;
    }

    createNumberInput(value, keyPath) {
        const input = document.createElement('input');
        input.type = 'number';
        input.className = 'border border-gray-300 rounded px-2 py-1 text-xs w-28 text-center focus:ring-1 focus:ring-blue-400';
        input.value = value;
        input.dataset.keyPath = keyPath;
        input.min = "1";
        input.max = "50";
        input.disabled = !this.isEditMode;
        return input;
    }

    createTextInput(value, keyPath) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'shadow appearance-none border rounded py-1 px-2 text-gray-700 text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 w-32';
        input.value = value;
        input.dataset.keyPath = keyPath;
        input.disabled = !this.isEditMode;
        return input;
    }

    createReadOnlyField(keyPath, value) {
        const settingRow = document.createElement('div');
        settingRow.className = 'flex justify-between items-center mb-1';

        const label = document.createElement('span');
        label.className = 'text-gray-700 text-sm font-semibold';
        label.textContent = MESSAGES.get(this.keyPathToI18nKey(keyPath));
        settingRow.appendChild(label);

        const valueSpan = document.createElement('span');
        valueSpan.className = 'text-gray-600 text-sm';
        valueSpan.textContent = value;
        settingRow.appendChild(valueSpan);

        this.formContainer.appendChild(settingRow);
    }

    createSectionTitle(keyPath) {
        // Skip section titles for cleaner look
        return;
    }

    createGroupTitle(title) {
        const groupTitle = document.createElement('h3');
        groupTitle.className = 'text-xs font-semibold text-gray-500 mt-2 mb-1 uppercase tracking-wide';
        groupTitle.textContent = title;
        this.formContainer.appendChild(groupTitle);
    }

    createGroupContainer() {
        const container = document.createElement('div');
        container.className = 'bg-gray-50 rounded p-2 mb-2 border border-gray-200';
        this.formContainer.appendChild(container);
        return container;
    }

    createArrayDisplay(keyPath, array) {
        const settingRow = document.createElement('div');
        settingRow.className = 'mb-2';

        const label = document.createElement('div');
        label.className = 'text-gray-700 text-sm font-semibold mb-1';
        label.textContent = keyPath === 'learningSettings.categories' ? MESSAGES.get('settingsCategories') : MESSAGES.get(this.keyPathToI18nKey(keyPath));
        settingRow.appendChild(label);

        const valueContainer = document.createElement('div');
        valueContainer.className = 'grid grid-cols-2 gap-1 text-xs';
        
        const categoryLabels = {
            'Vocabulary': '📚 Vocabulary',
            'Grammar': '📝 Grammar', 
            'PhrasalVerbs': '🔗 Phrasal Verbs',
            'Idioms': '💭 Idioms'
        };
        
        array.forEach(item => {
            const itemSpan = document.createElement('span');
            itemSpan.className = 'bg-gray-100 text-gray-700 px-2 py-1 rounded text-center';
            itemSpan.textContent = categoryLabels[item] || item;
            valueContainer.appendChild(itemSpan);
        });
        
        settingRow.appendChild(valueContainer);
        this.formContainer.appendChild(settingRow);
    }

    keyPathToI18nKey(keyPath) {
        const parts = keyPath.split('.');
        if (parts[0] === 'learningSettings' && parts.length > 1) {
            let i18nKey = 'settings';
            for (let i = 1; i < parts.length; i++) {
                i18nKey += parts[i].charAt(0).toUpperCase() + parts[i].slice(1);
            }
            return i18nKey;
        } else {
            let i18nKey = 'settings';
            for (const part of parts) {
                i18nKey += part.charAt(0).toUpperCase() + part.slice(1);
            }
            return i18nKey;
        }
    }

    getFormData() {
        const formData = {};
        this.formContainer.querySelectorAll('input[data-key-path], select[data-key-path]').forEach(input => {
            const keyPath = input.dataset.keyPath;
            
            if (input.multiple) {
                // Handle multiple select (categories)
                const selectedValues = Array.from(input.selectedOptions).map(option => option.value);
                formData[keyPath] = selectedValues;
            } else {
                let value = input.value;
                if (input.type === 'number' && !isNaN(value) && !isNaN(parseFloat(value))) {
                    value = parseFloat(value);
                }
                formData[keyPath] = value;
            }
        });
        return formData;
    }

    async applyChanges(formData) {
        // Validate data before saving
        for (const keyPath in formData) {
            const value = formData[keyPath];
            
            // Validate numeric values
            if (typeof value === 'number' && (value < 1 || value > 50)) {
                throw new Error(`Invalid value for ${keyPath}: ${value}`);
            }
            
            settingsManager.setSetting(keyPath, value);
        }
        
        // Save to localStorage for persistence
        localStorage.setItem('userSettings', JSON.stringify(settingsManager.settings));
        
        // Notify learningManager to refresh module settings
        if (window.learningManager && typeof window.learningManager.refreshModuleSettings === 'function') {
            window.learningManager.refreshModuleSettings();
            
            // If currently in a game, restart it with new settings
            if (window.app && window.app.currentModule) {
                window.learningManager.startModule(window.app.currentModule.id);
            }
        }
        
        // Refresh menu to apply filters
        if (window.app && window.app.currentView === 'menu') {
            window.app.renderMenu();
        }
    }

    toggleEditMode() {
        this.isEditMode = !this.isEditMode;
        
        // Add/remove Enter listener based on edit mode
        if (this.isEditMode) {
            document.removeEventListener('keydown', this.keyboardHandler);
        } else {
            document.addEventListener('keydown', this.keyboardHandler);
        }
        
        // Update disabled state of existing inputs instead of re-rendering
        this.formContainer.querySelectorAll('input, select').forEach(input => {
            input.disabled = !this.isEditMode;
        });
        
        this.updateText();
    }

    hide() {
        // Remove Enter listener when hiding
        document.removeEventListener('keydown', this.keyboardHandler);
        super.hide();
    }

    updateText() {
        if (this.saveBtn) {
            this.saveBtn.textContent = MESSAGES.get('saveButton');
            this.saveBtn.className = 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200';
            this.saveBtn.style.display = this.isEditMode ? 'inline-block' : 'none';
        }
        if (this.closeBtn) {
            this.closeBtn.textContent = MESSAGES.get('closeButton');
            this.closeBtn.className = 'bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded transition duration-200';
        }
        if (this.editBtn) {
            this.editBtn.textContent = this.isEditMode ? MESSAGES.get('cancelButton') : MESSAGES.get('editButton');
            this.editBtn.className = this.isEditMode ? 
                'bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200' :
                'bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-200';
        }
    }

    createCategoriesSelect(keyPath, selectedCategories) {
        const settingRow = document.createElement('div');
        settingRow.className = 'flex justify-between items-center py-1';

        const label = document.createElement('label');
        label.className = 'text-gray-600 text-xs flex-1';
        label.textContent = MESSAGES.get('settingsCategories');
        settingRow.appendChild(label);

        const select = document.createElement('select');
        select.className = 'border border-gray-300 rounded px-2 py-1 text-xs w-28 focus:ring-1 focus:ring-blue-400';
        select.dataset.keyPath = keyPath;
        select.multiple = true;
        select.size = 4;
        select.style.overflowY = 'scroll';

        const allCategories = ['Vocabulary', 'Grammar', 'PhrasalVerbs', 'Idioms'];
        const categoryLabels = {
            'Vocabulary': '📚 Vocabulary',
            'Grammar': '📝 Grammar', 
            'PhrasalVerbs': '🔗 Phrasal Verbs',
            'Idioms': '💭 Idioms'
        };
        
        allCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = categoryLabels[category] || category;
            option.selected = selectedCategories.includes(category);
            select.appendChild(option);
        });
        
        select.disabled = !this.isEditMode;
        settingRow.appendChild(select);
        (this.currentGroupContainer || this.formContainer).appendChild(settingRow);
    }

    updateModalTitle() {
        if (this.modalTitle) {
            this.modalTitle.textContent = MESSAGES.get('settingsTitle');
        }
    }
}