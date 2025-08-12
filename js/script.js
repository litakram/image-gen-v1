/**
 * Générateur d'Images IA - Script Principal
 * Gère la génération d'images via l'API Pollinations AI
 * Inclut la sanitisation des entrées, l'historique et le mode nuit
 */

// Configuration
const CONFIG = {
    API_BASE_URL: 'https://image.pollinations.ai/prompt',
    MAX_HISTORY: 5,
    STORAGE_KEY: 'ai-image-generator-history',
    NIGHT_MODE_KEY: 'ai-image-generator-night-mode'
};

// Éléments DOM
const DOM = {
    promptInput: document.getElementById('prompt-input'),
    widthSelect: document.getElementById('width-select'),
    heightSelect: document.getElementById('height-select'),
    generateBtn: document.getElementById('generate-btn'),
    generatedImage: document.getElementById('generated-image'),
    loadingSpinner: document.querySelector('.loading-spinner'),
    errorMessage: document.getElementById('error-message'),
    errorSpan: document.querySelector('#error-message span'),
    historyList: document.getElementById('history-list'),
    nightModeToggle: document.getElementById('night-mode-toggle'),
    promptButtons: document.querySelectorAll('.prompt-btn'),
    placeholderContent: document.querySelector('.placeholder-content'),
    noHistory: document.querySelector('.no-history')
};

// État de l'application
let generationHistory = [];
let isGenerating = false;

/**
 * Initialise l'application
 */
function initializeApp() {
    loadHistory();
    loadNightModePreference();
    setupEventListeners();
    updateHistoryDisplay();
    
    // Focus sur le champ de prompt pour une meilleure UX
    DOM.promptInput.focus();
    
    console.log('🎨 Générateur d\'Images IA initialisé');
}

/**
 * Configure tous les écouteurs d'événements
 */
function setupEventListeners() {
    // Génération d'image
    DOM.generateBtn.addEventListener('click', handleGenerate);
    
    // Génération avec la touche Entrée
    DOM.promptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleGenerate();
        }
    });
    
    // Mode nuit
    DOM.nightModeToggle.addEventListener('click', toggleNightMode);
    
    // Prompts structurés
    DOM.promptButtons.forEach(button => {
        button.addEventListener('click', () => {
            const prompt = button.dataset.prompt;
            DOM.promptInput.value = prompt;
            DOM.promptInput.focus();
            
            // Animation de feedback
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
        });
    });
    
    // Accessibilité - navigation au clavier pour les prompts
    DOM.promptButtons.forEach((button, index) => {
        button.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                const nextIndex = (index + 1) % DOM.promptButtons.length;
                DOM.promptButtons[nextIndex].focus();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                const prevIndex = (index - 1 + DOM.promptButtons.length) % DOM.promptButtons.length;
                DOM.promptButtons[prevIndex].focus();
            }
        });
    });
}

/**
 * Sanitise l'entrée utilisateur pour prévenir les injections
 * @param {string} input - Texte à sanitiser
 * @returns {string} Texte sanitisé
 */
function sanitizeInput(input) {
    if (!input || typeof input !== 'string') return '';
    
    // Supprime les caractères dangereux et limite la longueur
    return input
        .trim()
        .replace(/[<>\"'&]/g, '') // Supprime les caractères HTML dangereux
        .replace(/[{}[\]]/g, '') // Supprime les caractères de structure
        .substring(0, 500); // Limite à 500 caractères
}

/**
 * Valide les paramètres de génération
 * @param {string} prompt - Prompt utilisateur
 * @param {string} width - Largeur de l'image
 * @param {string} height - Hauteur de l'image
 * @returns {Object} Résultat de validation
 */
function validateGenerationParams(prompt, width, height) {
    const errors = [];
    
    if (!prompt || prompt.length < 3) {
        errors.push('Le prompt doit contenir au moins 3 caractères');
    }
    
    if (prompt.length > 500) {
        errors.push('Le prompt ne peut pas dépasser 500 caractères');
    }
    
    const validSizes = ['512', '768', '1024'];
    if (!validSizes.includes(width)) {
        errors.push('Largeur invalide');
    }
    
    if (!validSizes.includes(height)) {
        errors.push('Hauteur invalide');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Construit l'URL de l'API
 * @param {string} prompt - Prompt sanitisé
 * @param {string} width - Largeur
 * @param {string} height - Hauteur
 * @returns {string} URL de l'API
 */
function buildApiUrl(prompt, width, height) {
    const encodedPrompt = encodeURIComponent(prompt);
    return `${CONFIG.API_BASE_URL}/${encodedPrompt}?width=${width}&height=${height}&seed=-1&model=flux`;
}

/**
 * Affiche l'état de chargement
 */
function showLoading() {
    DOM.placeholderContent.style.display = 'none';
    DOM.generatedImage.style.display = 'none';
    DOM.errorMessage.style.display = 'none';
    DOM.loadingSpinner.style.display = 'flex';
    DOM.generateBtn.disabled = true;
    DOM.generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Génération...</span>';
    isGenerating = true;
}

/**
 * Masque l'état de chargement
 */
function hideLoading() {
    DOM.loadingSpinner.style.display = 'none';
    DOM.generateBtn.disabled = false;
    DOM.generateBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i><span>Générer l\'image</span>';
    isGenerating = false;
}

/**
 * Affiche un message d'erreur
 * @param {string} message - Message d'erreur
 */
function showError(message) {
    DOM.errorSpan.textContent = message;
    DOM.errorMessage.style.display = 'flex';
    DOM.generatedImage.style.display = 'none';
    DOM.placeholderContent.style.display = 'block';
    
    // Animation d'erreur
    DOM.errorMessage.style.animation = 'none';
    setTimeout(() => {
        DOM.errorMessage.style.animation = 'fadeInUp 0.3s ease-out';
    }, 10);
}

/**
 * Affiche l'image générée
 * @param {string} imageUrl - URL de l'image
 */
function showGeneratedImage(imageUrl) {
    DOM.placeholderContent.style.display = 'none';
    DOM.errorMessage.style.display = 'none';
    DOM.generatedImage.src = imageUrl;
    DOM.generatedImage.style.display = 'block';
    
    // Animation d'apparition
    DOM.generatedImage.style.opacity = '0';
    DOM.generatedImage.style.transform = 'scale(0.9)';
    
    DOM.generatedImage.onload = () => {
        DOM.generatedImage.style.transition = 'all 0.3s ease-out';
        DOM.generatedImage.style.opacity = '1';
        DOM.generatedImage.style.transform = 'scale(1)';
    };
}

/**
 * Gère la génération d'image
 */
async function handleGenerate() {
    if (isGenerating) return;
    
    const rawPrompt = DOM.promptInput.value;
    const width = DOM.widthSelect.value;
    const height = DOM.heightSelect.value;
    
    // Sanitisation
    const sanitizedPrompt = sanitizeInput(rawPrompt);
    
    // Validation
    const validation = validateGenerationParams(sanitizedPrompt, width, height);
    if (!validation.isValid) {
        showError(validation.errors.join('. '));
        return;
    }
    
    showLoading();
    
    try {
        const apiUrl = buildApiUrl(sanitizedPrompt, width, height);
        console.log('🔗 URL API:', apiUrl);
        
        // Génération avec timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 100000); // 100 secondes
        
        const response = await fetch(apiUrl, {
            signal: controller.signal,
            headers: {
                'Accept': 'image/*'
            }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        }
        
        // L'API retourne directement l'image
        const imageUrl = response.url;
        
        // Vérification que l'image est valide
        await validateImageUrl(imageUrl);
        
        showGeneratedImage(imageUrl);
        
        // Ajout à l'historique
        addToHistory({
            prompt: sanitizedPrompt,
            originalPrompt: rawPrompt,
            imageUrl,
            width,
            height,
            timestamp: Date.now()
        });
        
        console.log('✅ Image générée avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors de la génération:', error);
        
        let errorMessage = 'Une erreur est survenue lors de la génération';
        
        if (error.name === 'AbortError') {
            errorMessage = 'La génération a pris trop de temps. Veuillez réessayer.';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Problème de connexion. Vérifiez votre connexion internet.';
        } else if (error.message.includes('HTTP')) {
            errorMessage = 'Erreur du serveur. Veuillez réessayer dans quelques instants.';
        }
        
        showError(errorMessage);
    } finally {
        hideLoading();
    }
}

/**
 * Valide qu'une URL d'image est accessible
 * @param {string} imageUrl - URL à valider
 * @returns {Promise} Promise qui se résout si l'image est valide
 */
function validateImageUrl(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image non valide'));
        img.src = imageUrl;
    });
}

/**
 * Ajoute un élément à l'historique
 * @param {Object} item - Élément à ajouter
 */
function addToHistory(item) {
    // Supprime les doublons basés sur le prompt
    generationHistory = generationHistory.filter(
        existing => existing.prompt !== item.prompt
    );
    
    // Ajoute au début
    generationHistory.unshift(item);
    
    // Limite à MAX_HISTORY éléments
    if (generationHistory.length > CONFIG.MAX_HISTORY) {
        generationHistory = generationHistory.slice(0, CONFIG.MAX_HISTORY);
    }
    
    saveHistory();
    updateHistoryDisplay();
}

/**
 * Met à jour l'affichage de l'historique
 */
function updateHistoryDisplay() {
    if (generationHistory.length === 0) {
        DOM.noHistory.style.display = 'block';
        return;
    }
    
    DOM.noHistory.style.display = 'none';
    
    // Supprime les éléments existants sauf le placeholder
    const existingItems = DOM.historyList.querySelectorAll('.history-item');
    existingItems.forEach(item => item.remove());
    
    // Ajoute les nouveaux éléments
    generationHistory.forEach((item, index) => {
        const historyItem = createHistoryItem(item, index);
        DOM.historyList.appendChild(historyItem);
    });
}

/**
 * Crée un élément d'historique
 * @param {Object} item - Données de l'élément
 * @param {number} index - Index dans l'historique
 * @returns {HTMLElement} Élément DOM
 */
function createHistoryItem(item, index) {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.setAttribute('role', 'button');
    historyItem.setAttribute('tabindex', '0');
    historyItem.setAttribute('aria-label', `Réutiliser: ${item.originalPrompt}`);
    
    const img = document.createElement('img');
    img.src = item.imageUrl;
    img.alt = item.originalPrompt;
    img.loading = 'lazy';
    
    historyItem.appendChild(img);
    
    // Gestionnaire de clic/clavier
    const handleActivation = () => {
        DOM.promptInput.value = item.originalPrompt;
        DOM.widthSelect.value = item.width;
        DOM.heightSelect.value = item.height;
        showGeneratedImage(item.imageUrl);
        DOM.promptInput.focus();
        
        // Animation de feedback
        historyItem.style.transform = 'scale(0.95)';
        setTimeout(() => {
            historyItem.style.transform = '';
        }, 150);
    };
    
    historyItem.addEventListener('click', handleActivation);
    historyItem.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleActivation();
        }
    });
    
    // Animation d'entrée
    historyItem.style.opacity = '0';
    historyItem.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        historyItem.style.transition = 'all 0.3s ease-out';
        historyItem.style.opacity = '1';
        historyItem.style.transform = 'translateY(0)';
    }, index * 100);
    
    return historyItem;
}

/**
 * Sauvegarde l'historique dans le localStorage
 */
function saveHistory() {
    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(generationHistory));
    } catch (error) {
        console.warn('⚠️ Impossible de sauvegarder l\'historique:', error);
    }
}

/**
 * Charge l'historique depuis le localStorage
 */
function loadHistory() {
    try {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        if (saved) {
            generationHistory = JSON.parse(saved);
            console.log(`📚 Historique chargé: ${generationHistory.length} éléments`);
        }
    } catch (error) {
        console.warn('⚠️ Impossible de charger l\'historique:', error);
        generationHistory = [];
    }
}

/**
 * Bascule le mode nuit
 */
function toggleNightMode() {
    document.body.classList.toggle('night-mode');
    const isNightMode = document.body.classList.contains('night-mode');
    
    // Sauvegarde de la préférence
    try {
        localStorage.setItem(CONFIG.NIGHT_MODE_KEY, isNightMode.toString());
    } catch (error) {
        console.warn('⚠️ Impossible de sauvegarder la préférence de mode:', error);
    }
    
    // Animation du bouton
    DOM.nightModeToggle.style.transform = 'rotate(180deg)';
    setTimeout(() => {
        DOM.nightModeToggle.style.transform = '';
    }, 300);
    
    console.log(`🌙 Mode nuit: ${isNightMode ? 'activé' : 'désactivé'}`);
}

/**
 * Charge la préférence de mode nuit
 */
function loadNightModePreference() {
    try {
        const saved = localStorage.getItem(CONFIG.NIGHT_MODE_KEY);
        if (saved === 'true') {
            document.body.classList.add('night-mode');
        }
    } catch (error) {
        console.warn('⚠️ Impossible de charger la préférence de mode:', error);
    }
}

/**
 * Gestion des raccourcis clavier globaux
 */
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter pour générer
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
    }
    
    // Ctrl/Cmd + D pour basculer le mode nuit
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        toggleNightMode();
    }
});

/**
 * Gestion des erreurs globales
 */
window.addEventListener('error', (e) => {
    console.error('❌ Erreur globale:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('❌ Promise rejetée:', e.reason);
});

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', initializeApp);

// Export pour les tests (si nécessaire)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sanitizeInput,
        validateGenerationParams,
        buildApiUrl
    };
}

