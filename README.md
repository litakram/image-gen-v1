# 🎨 Générateur d'Images IA avec Gemini     /https://image-gen-v1.surge.sh/

Une application web moderne qui combine l'intelligence artificielle de Google Gemini et Pollinations AI pour générer des images de haute qualité à partir de descriptions textuelles.

![Version](https://img.shields.io/badge/Version-1.0-blue)
![Technologies](https://img.shields.io/badge/Technologies-HTML%20|%20CSS%20|%20JavaScript-yellow)
![API](https://img.shields.io/badge/APIs-Gemini%20|%20Pollinations-green)

## ✨ Fonctionnalités Principales

### 🧠 Amélioration de Prompt par Gemini
- **Optimisation intelligente** des descriptions utilisateur via l'API Gemini
- **Transformation de prompts simples** en descriptions détaillées et créatives
- **Notification persistante** montrant la comparaison entre prompt original et amélioré
- **Adaptation contextuelle** selon le style sélectionné

### 🎭 Catégories de Styles
- **Styles artistiques**: Impressionnisme, Cubisme, Pixel Art, Aquarelle, Néo-classique
- **Photographie**: HDR, Macro, Noir et Blanc, Portrait Studio
- **Fantastique & Sci-Fi**: Fantasy, Sci-Fi, Cyberpunk, Mystique
- **Paysages**: Montagnes, Plage, Forêt, Désert
- **Concepts abstraits**: Amour, Temps, Liberté, Croissance

### 🖼️ Interface Utilisateur
- **Design moderne et responsive** adapté à tous les appareils
- **Mode nuit** avec bascule automatique et sauvegarde des préférences
- **Animations fluides** et micro-interactions pour une expérience utilisateur optimale
- **Badge de style appliqué** pour visualiser la sélection active

### 📚 Historique et Génération
- **Historique des 5 dernières générations** avec miniatures
- **Réutilisation facile** des prompts et paramètres précédents
- **Sauvegarde locale** des préférences et de l'historique
- **Sélecteurs de dimensions** (512x512, 768x768, 1024x1024)
- **Génération en temps réel** avec indicateur de chargement

### 🔒 Sécurité et Performance
- **Sanitisation des entrées** pour prévenir les injections
- **Validation des paramètres** avant envoi aux APIs
- **Gestion intelligente des erreurs** pour les deux APIs (Gemini et Pollinations)
- **Optimisation du chargement** pour une expérience utilisateur fluide

### ♿ Accessibilité
- **Navigation au clavier** complète
- **Labels ARIA** appropriés
- **Contraste élevé** en mode nuit
- **Focus visible** sur tous les éléments interactifs
- **Structure sémantique** pour les lecteurs d'écran

## 🚀 Comment Utiliser

### 1. Création d'une Image
1. Saisissez une description dans le champ de texte
2. **Optionnel**: Sélectionnez un style artistique dans les catégories proposées
3. Choisissez les dimensions souhaitées
4. Cliquez sur "Générer l'image" ou utilisez le raccourci Ctrl+Entrée
5. Observez la notification montrant l'amélioration du prompt par Gemini
6. Visualisez l'image générée dans la zone de prévisualisation

### 2. Styles Artistiques
- Cliquez sur n'importe quel style pour l'appliquer à votre description
- Le style sélectionné apparaît dans un badge sous le champ de texte
- Le prompt est envoyé à Gemini avec le style choisi pour optimisation
- Les styles sont regroupés par catégories pour une navigation facile

### 3. Raccourcis et Astuces
- **Ctrl/Cmd + Entrée** : Générer une image rapidement
- **Ctrl/Cmd + D** : Basculer entre mode jour/nuit
- Consultez l'historique pour vous inspirer de générations précédentes

## � Structure du Projet

```
image-generator-v1/
├── index.html          # Structure HTML avec les catégories de styles
├── css/
│   └── style.css       # Styles CSS avec variables et design responsive
├── js/
│   └── script.js       # Logique JavaScript avec intégration Gemini et Pollinations
└── README.md           # Documentation
```

## ⚙️ Intégrations API

### Google Gemini
- **API**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- **Modèle**: `gemini-2.0-flash`
- **Fonctionnalité**: Amélioration des prompts utilisateur pour optimiser la génération d'images
- **Personnalisation**: Adaptation du prompt selon le style artistique sélectionné

### Pollinations AI
- **API**: `https://image.pollinations.ai/prompt/{prompt}`
- **Paramètres**: width, height, seed=-1, model=flux
- **Fonctionnalité**: Génération d'images à partir du prompt amélioré par Gemini

## 💡 Fonctionnalités Techniques

### Traitement des Prompts
- **Analyse contextuelle** des descriptions utilisateur
- **Structuration intelligente** en sujet et style
- **Optimisation sémantique** pour des résultats visuels précis
- **Conservation du sujet original** lors de l'application d'un style

### Notification d'Amélioration
- **Affichage comparatif** du prompt original et amélioré
- **Badge de style appliqué** lorsqu'un style est sélectionné
- **Persistance jusqu'à fermeture** par l'utilisateur via le bouton X

### Stockage Local
- **Historique des générations**: `ai-image-generator-history`
- **Préférences utilisateur**: `ai-image-generator-night-mode`
- **Format JSON** pour les données sauvegardées

## 🛠️ Personnalisation

### Variables CSS
Le fichier `style.css` utilise des variables CSS pour faciliter la personnalisation :

```css
:root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    --background-color: #f8fafc;
    --surface-color: #ffffff;
    /* ... autres variables */
}
```

### Styles et Catégories
Modifiez les styles dans les boutons du fichier `index.html` :

```html
<button class="prompt-btn" data-prompt="Sujet initial" data-style="style artistique désiré">
    <i class="fas fa-icon"></i> Nom du Style
</button>
```

### Configuration API
Modifiez la configuration dans `script.js` :

```javascript
const CONFIG = {
    API_BASE_URL: 'https://image.pollinations.ai/prompt',
    GEMINI_API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    GEMINI_API_KEY: 'votre_clé_api',
    MAX_HISTORY: 5,
    STORAGE_KEY: 'ai-image-generator-history',
    NIGHT_MODE_KEY: 'ai-image-generator-night-mode'
};
```

## 📋 Compatibilité

### Navigateurs Supportés
- **Chrome/Edge**: 88+
- **Firefox**: 86+
- **Safari**: 14+
- **Opera**: 74+

### Fonctionnalités Requises
- JavaScript ES6+ (async/await, const/let, arrow functions)
- Fetch API et JSON
- CSS Grid et Flexbox
- CSS Custom Properties (variables)
- LocalStorage

## 🐛 Dépannage

### Problèmes Courants

**L'amélioration Gemini ne fonctionne pas:**
- Vérifiez votre connexion internet
- Assurez-vous que la clé API Gemini est valide
- Le service peut être temporairement indisponible

**L'image ne se génère pas:**
- L'API Pollinations peut être surchargée
- Essayez un prompt plus court ou différent
- Vérifiez votre connexion réseau

**Le style n'est pas appliqué correctement:**
- Assurez-vous qu'un style est bien sélectionné (visible dans le badge)
- Vérifiez que le prompt est compatible avec le style choisi

**Le mode nuit ne se sauvegarde pas:**
- Vérifiez que le LocalStorage est activé dans votre navigateur
- Certains navigateurs en mode privé limitent le stockage local

### Messages d'Erreur
- **"Erreur API Gemini"** : Problème avec la clé API ou le service Gemini
- **"Erreur HTTP 502"** : Service Pollinations temporairement indisponible
- **"Problème de connexion"** : Vérifiez votre connexion internet

## 📝 Crédits et Licence

Ce projet est fourni à des fins éducatives et de démonstration.

- **APIs**: 
  - [Google Gemini](https://ai.google.dev)
  - [Pollinations AI](https://pollinations.ai)
- **Icons**: Font Awesome 6.0.0
- **Développement**: Ai Crafters

## 🚀 Prochaines Fonctionnalités

Fonctionnalités envisagées pour les prochaines versions :
- Sauvegarde cloud des générations
- Plus de paramètres de génération avancés
- Ajustement et édition d'images après génération
- Partage direct sur les réseaux sociaux

---

**Créé avec passion par Ai Crafters** ❤️

