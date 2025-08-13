/**
 * Générateur d'Images IA - Script Principal
 * Gère la génération d'images via l'API Pollinations AI
 * Inclut la sanitisation des entrées, l'historique et le mode nuit
 */

// Configuration
const CONFIG = {
    API_BASE_URL: 'https://image.pollinations.ai/prompt',
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    GEMINI_API_KEY: 'AIzaSyCpY4V7DVwJSNBOJWNi-E6wK8BIVWHYzXU', // Clé API Gemini
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
    promptCategories: document.querySelectorAll('.prompt-category'),
    placeholderContent: document.querySelector('.placeholder-content'),
    noHistory: document.querySelector('.no-history')
};

// État de l'application
let generationHistory = [];
let isGenerating = false;
let selectedStyle = ''; // Variable globale pour stocker le style actuellement sélectionné

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
    
    // Prompts structurés - utilisation uniquement du style sans changer l'input
    DOM.promptButtons.forEach(button => {
        button.addEventListener('click', () => {
            // On récupère uniquement le style
            selectedStyle = button.dataset.style || '';
            
            // On ne modifie PAS le contenu du champ de saisie
            // mais on garde le focus sur le champ
            DOM.promptInput.focus();
            
            // Mise en surbrillance du bouton actif
            document.querySelectorAll('.prompt-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            
            // Animation de feedback
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = '';
            }, 150);
            
            // Indication visuelle du style sélectionné
            const styleBadge = document.getElementById('selected-style-badge') || createStyleBadge();
            updateStyleBadge(styleBadge, selectedStyle);
            
            console.log('� Style suggéré sélectionné:', selectedStyle);
        });
    });
    
    // Fonction pour créer le badge de style
    function createStyleBadge() {
        const badge = document.createElement('div');
        badge.id = 'selected-style-badge';
        badge.className = 'selected-style-badge';
        
        // Ajouter à côté du bouton générer
        DOM.generateBtn.parentNode.insertBefore(badge, DOM.generateBtn);
        return badge;
    }
    
    // Mettre à jour le badge de style
    function updateStyleBadge(badge, style) {
        if (!style) {
            badge.style.display = 'none';
            return;
        }
        
        badge.style.display = 'flex';
        badge.innerHTML = `<i class="fas fa-palette"></i> Style: <span>${style}</span>
                          <button class="clear-style"><i class="fas fa-times"></i></button>`;
        
        // Ajouter un gestionnaire pour effacer le style
        const clearBtn = badge.querySelector('.clear-style');
        clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedStyle = '';
            badge.style.display = 'none';
            
            // Déselectionner tous les boutons
            document.querySelectorAll('.prompt-btn').forEach(btn => {
                btn.classList.remove('active');
            });
        });
    }
    
    // Accessibilité - navigation au clavier pour les prompts
    DOM.promptButtons.forEach((button, index) => {
        button.addEventListener('keydown', (e) => {
            const currentCategory = button.closest('.prompt-category');
            const categoryButtons = Array.from(currentCategory.querySelectorAll('.prompt-btn'));
            const buttonIndexInCategory = categoryButtons.indexOf(button);
            
            if (e.key === 'ArrowRight') {
                e.preventDefault();
                const nextIndex = (buttonIndexInCategory + 1) % categoryButtons.length;
                categoryButtons[nextIndex].focus();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const prevIndex = (buttonIndexInCategory - 1 + categoryButtons.length) % categoryButtons.length;
                categoryButtons[prevIndex].focus();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                // Aller à la catégorie suivante
                const categories = Array.from(document.querySelectorAll('.prompt-category'));
                const categoryIndex = categories.indexOf(currentCategory);
                const nextCategoryIndex = (categoryIndex + 1) % categories.length;
                
                if (categories[nextCategoryIndex]) {
                    const nextCategoryButtons = categories[nextCategoryIndex].querySelectorAll('.prompt-btn');
                    if (nextCategoryButtons.length > 0) {
                        // Essayer de conserver la même position horizontale
                        const targetIndex = Math.min(buttonIndexInCategory, nextCategoryButtons.length - 1);
                        nextCategoryButtons[targetIndex].focus();
                    }
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                // Aller à la catégorie précédente
                const categories = Array.from(document.querySelectorAll('.prompt-category'));
                const categoryIndex = categories.indexOf(currentCategory);
                const prevCategoryIndex = (categoryIndex - 1 + categories.length) % categories.length;
                
                if (categories[prevCategoryIndex]) {
                    const prevCategoryButtons = categories[prevCategoryIndex].querySelectorAll('.prompt-btn');
                    if (prevCategoryButtons.length > 0) {
                        // Essayer de conserver la même position horizontale
                        const targetIndex = Math.min(buttonIndexInCategory, prevCategoryButtons.length - 1);
                        prevCategoryButtons[targetIndex].focus();
                    }
                }
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
 * Analyse le prompt pour identifier s'il provient des suggestions structurées
 * @param {string} prompt - Le prompt à analyser
 * @returns {Object} Informations sur le prompt (sujet, style, etc.)
 */
function analyzePrompt(prompt) {
    // Vérifier si le prompt suit le format "sujet, style"
    const parts = prompt.split(',').map(part => part.trim());
    
    // Si nous avons au moins 2 parties, considérons la première comme sujet et le reste comme style
    if (parts.length >= 2) {
        return {
            subject: parts[0],
            style: parts.slice(1).join(', '),
            isStructured: true
        };
    }
    
    // Sinon c'est un prompt libre
    return {
        subject: prompt,
        style: '',
        isStructured: false
    };
}

/**
 * Améliore le prompt utilisateur avec l'API Gemini
 * Transforme un prompt simple en description détaillée pour de meilleurs résultats
 * @param {string} prompt - Prompt original de l'utilisateur
 * @returns {Promise<string>} - Prompt amélioré ou prompt original en cas d'erreur
 */
async function enhancePromptWithGemini(prompt) {
    console.log('🧠 Demande d\'amélioration du prompt à Gemini:', prompt);
    console.log('🎭 Style sélectionné:', selectedStyle ? selectedStyle : 'Aucun style sélectionné');
    
    try {
        // Construction du message pour Gemini en fonction du style sélectionné ou non
        let geminiPrompt;
        
        if (selectedStyle) {
            // Si un style est sélectionné, on l'applique directement au prompt utilisateur
            console.log('🎭 Application du style suggéré:', selectedStyle);
            
            geminiPrompt = `Crée un prompt détaillé pour générer une image IA de haute qualité.
                           Sujet de l'image: "${prompt}"
                           Style artistique à appliquer: "${selectedStyle}"
                           
                           Développe ce prompt en combinant le sujet demandé avec le style indiqué:
                           1. Garde le sujet principal exactement comme demandé
                           2. Applique le style artistique spécifié de manière cohérente
                           3. Ajoute des détails visuels précis sur la composition, l'éclairage, les couleurs
                           4. Enrichis avec des éléments techniques qui renforcent le style mentionné
                           
                           Format de réponse: une description détaillée, concise et cohérente.
                           Maximum 100 mots. Pas d'introduction ni de conclusion.`;
        } else {
            // Si aucun style n'est sélectionné, analyse du prompt pour l'amélioration standard
            const promptInfo = analyzePrompt(prompt);
            
            if (promptInfo.isStructured) {
                geminiPrompt = `Crée un prompt détaillé pour générer une image IA de haute qualité.
                               Sujet principal: "${promptInfo.subject}"
                               Style indiqué: "${promptInfo.style}"
                               
                               Développe ce prompt en enrichissant ces éléments:
                               1. Description visuelle précise du sujet principal
                               2. Détails sur la composition, l'éclairage, les couleurs, la perspective
                               3. Ambiance et atmosphère générale
                               4. Détails techniques comme la résolution, le rendu, les effets spécifiques
                               
                               Format de réponse: une description détaillée, concise et cohérente.
                               Maximum 100 mots. Pas d'introduction ni de conclusion.`;
            } else {
                geminiPrompt = `Améliore ce prompt pour générer une image IA de haute qualité: "${prompt}"
                               
                               Ne change pas le sujet principal mais ajoute des détails sur:
                               - Style artistique et technique de rendu
                               - Éclairage, ombres et atmosphère
                               - Perspective, composition et cadrage
                               - Couleurs, contrastes et tonalités
                               - Détails qui ajoutent du réalisme ou de l'impact
                               
                               Maximum 100 mots. Pas d'introduction ni de conclusion.`;
            }
        }
        
        // Construit le corps de la requête pour l'API Gemini
        const requestBody = {
            contents: [{
                parts: [{
                    text: geminiPrompt
                }]
            }]
        };
        
        // Appel à l'API Gemini
        const response = await fetch(CONFIG.GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': CONFIG.GEMINI_API_KEY
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`Erreur API Gemini: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Extraction du texte amélioré depuis la réponse
        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            const enhancedPrompt = data.candidates[0].content.parts[0].text.trim();
            console.log('🎨 Prompt amélioré par Gemini:', enhancedPrompt);
            return enhancedPrompt;
        } else {
            console.warn('⚠️ Format de réponse Gemini inattendu:', data);
            return prompt; // En cas de réponse mal formatée, on retourne le prompt original
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'amélioration du prompt avec Gemini:', error);
        // En cas d'erreur, on retourne le prompt original
        return prompt;
    }
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
 * Affiche une notification montrant comment Gemini a amélioré le prompt
 * @param {string} originalPrompt - Le prompt original de l'utilisateur
 * @param {string} enhancedPrompt - Le prompt amélioré par Gemini
 * @param {string} appliedStyle - Le style appliqué, s'il y en a un
 */
function showPromptEnhancementNotification(originalPrompt, enhancedPrompt, appliedStyle = '') {
    // Supprimer les anciennes notifications
    const existingNotifs = document.querySelectorAll('.prompt-enhancement-notification');
    existingNotifs.forEach(notif => notif.remove());
    
    // Créer une nouvelle notification
    const notification = document.createElement('div');
    notification.className = 'prompt-enhancement-notification';
    
    // Contenu de base de la notification
    let notificationContent = `
        <div class="notification-header">
            <i class="fas fa-magic"></i> Prompt amélioré par Gemini
            <button class="close-btn"><i class="fas fa-times"></i></button>
        </div>
        <div class="notification-content">
    `;
    
    // Ajouter le style appliqué s'il y en a un
    if (appliedStyle) {
        notificationContent += `
            <div class="applied-style">
                <i class="fas fa-palette"></i> Style appliqué: <span>${appliedStyle}</span>
            </div>
        `;
    }
    
    // Ajouter la comparaison des prompts
    notificationContent += `
            <div class="prompt-comparison">
                <div class="prompt-original">
                    <h4>Prompt original</h4>
                    <p>${originalPrompt}</p>
                </div>
                <div class="prompt-arrow">
                    <i class="fas fa-arrow-right"></i>
                </div>
                <div class="prompt-enhanced">
                    <h4>Prompt amélioré</h4>
                    <p>${enhancedPrompt}</p>
                </div>
            </div>
        </div>
    `;
    
    notification.innerHTML = notificationContent;
    
    // Ajouter au DOM
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.classList.add('visible');
    }, 100);
    
    // Fonction de fermeture uniquement lorsque l'utilisateur clique sur X
    const closeBtn = notification.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('visible');
        setTimeout(() => {
            notification.remove();
        }, 300);
    });
    
    // Aucune fermeture automatique - la notification reste jusqu'à ce que l'utilisateur la ferme
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
        // Amélioration du prompt avec Gemini
        const enhancedPrompt = await enhancePromptWithGemini(sanitizedPrompt);
        
        // Utilisation du prompt amélioré pour la génération d'image
        const apiUrl = buildApiUrl(enhancedPrompt, width, height);
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
        
        // Afficher une notification avec le prompt amélioré
        showPromptEnhancementNotification(rawPrompt, enhancedPrompt, selectedStyle);
        
        // Ajout à l'historique avec le prompt original et le prompt amélioré
        addToHistory({
            prompt: enhancedPrompt,
            originalPrompt: rawPrompt,
            enhancedPrompt: enhancedPrompt, // Sauvegarde du prompt amélioré
            appliedStyle: selectedStyle,    // Style utilisé pour cette génération
            imageUrl,
            width,
            height,
            timestamp: Date.now()
        });
        
        // Réinitialiser le style sélectionné après génération
        if (selectedStyle) {
            console.log('🧹 Réinitialisation du style après génération:', selectedStyle);
            selectedStyle = '';
            document.querySelectorAll('.prompt-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            const styleBadge = document.getElementById('selected-style-badge');
            if (styleBadge) styleBadge.style.display = 'none';
        }
        
        console.log('✅ Image générée avec succès');
        console.log('📝 Prompt original:', rawPrompt);
        console.log('🧠 Prompt amélioré utilisé:', enhancedPrompt);
        
    } catch (error) {
        console.error('❌ Erreur lors de la génération:', error);
        
        let errorMessage = 'Une erreur est survenue lors de la génération';
        
        if (error.name === 'AbortError') {
            errorMessage = 'La génération a pris trop de temps. Veuillez réessayer.';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Problème de connexion. Vérifiez votre connexion internet.';
        } else if (error.message.includes('HTTP')) {
            errorMessage = 'Erreur du serveur. Veuillez réessayer dans quelques instants.';
        } else if (error.message.includes('Gemini')) {
            errorMessage = 'Erreur lors de l\'amélioration du prompt. Veuillez réessayer.';
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
    
    // Ajouter une info-bulle avec les prompts (original et amélioré)
    const tooltipText = item.enhancedPrompt ? 
        `Original: "${item.originalPrompt}"\nAmélioré: "${item.enhancedPrompt}"` : 
        item.originalPrompt;
    historyItem.setAttribute('title', tooltipText);
    
    // Ajouter une indication visuelle que le prompt a été amélioré
    if (item.enhancedPrompt && item.enhancedPrompt !== item.originalPrompt) {
        const enhancedBadge = document.createElement('div');
        enhancedBadge.className = 'enhanced-badge';
        enhancedBadge.innerHTML = '<i class="fas fa-magic"></i>';
        enhancedBadge.title = 'Prompt amélioré par IA';
        historyItem.appendChild(enhancedBadge);
    }
    
    const img = document.createElement('img');
    img.src = item.imageUrl;
    img.alt = item.originalPrompt;
    img.loading = 'lazy';
    
    historyItem.appendChild(img);
    
    // Gestionnaire de clic/clavier
    const handleActivation = () => {
        // Par défaut, on met le prompt original dans le champ de saisie
        DOM.promptInput.value = item.originalPrompt;
        
        // On peut aussi ajouter une option pour utiliser directement le prompt amélioré
        // si le clic est fait avec la touche Alt ou Shift
        if (window.event && (window.event.altKey || window.event.shiftKey) && item.enhancedPrompt) {
            DOM.promptInput.value = item.enhancedPrompt;
        }
        
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

