# Générateur d'Images IA         https://image-gen-v1.surge.sh/

Une plateforme web moderne et responsive pour générer des images à partir de descriptions textuelles en utilisant l'API Pollinations AI.

## 🎨 Fonctionnalités

### Interface Utilisateur
- **Design moderne et minimaliste** avec un gradient coloré unique
- **Mode nuit** avec bascule automatique et sauvegarde des préférences
- **Interface responsive** adaptée aux appareils mobiles et desktop
- **Animations fluides** et micro-interactions pour une expérience utilisateur optimale

### Génération d'Images
- **Prompts personnalisés** avec zone de texte extensible
- **Prompts structurés prédéfinis** pour différentes thématiques (Paysage, Animal, Futuriste, Portrait, Fantaisie)
- **Sélecteurs de dimensions** (512x512, 768x768, 1024x1024)
- **Génération en temps réel** avec indicateur de chargement
- **Gestion d'erreurs robuste** avec messages informatifs

### Historique et Navigation
- **Historique des 5 dernières générations** avec miniatures
- **Réutilisation facile** des prompts et paramètres précédents
- **Sauvegarde locale** des préférences et de l'historique

### Sécurité et Performance
- **Sanitisation des entrées** pour prévenir les injections
- **Validation des paramètres** avant envoi à l'API
- **Timeout de requête** (30 secondes) pour éviter les blocages
- **Gestion des erreurs réseau** avec messages explicites

### Accessibilité
- **Navigation au clavier** complète
- **Labels ARIA** appropriés
- **Contraste élevé** en mode nuit
- **Focus visible** sur tous les éléments interactifs

## 🚀 Utilisation

### Installation
1. Téléchargez et décompressez l'archive
2. Ouvrez le fichier `index.html` dans votre navigateur web moderne

### Génération d'Images
1. **Saisissez votre prompt** dans la zone de texte ou utilisez un prompt suggéré
2. **Sélectionnez les dimensions** souhaitées (largeur et hauteur)
3. **Cliquez sur "Générer l'image"** ou appuyez sur Ctrl+Entrée
4. **Attendez la génération** (indicateur de chargement visible)
5. **Visualisez le résultat** dans la zone de prévisualisation

### Raccourcis Clavier
- **Ctrl/Cmd + Entrée** : Générer une image
- **Ctrl/Cmd + D** : Basculer le mode nuit
- **Entrée** dans le champ prompt : Générer une image
- **Flèches directionnelles** : Navigation entre les prompts suggérés

### Historique
- Les 5 dernières générations sont automatiquement sauvegardées
- Cliquez sur une miniature pour réutiliser le prompt et les paramètres
- L'historique est conservé entre les sessions

## 🛠️ Structure du Projet

```
image-generator/
├── index.html          # Structure HTML principale
├── css/
│   └── style.css       # Styles CSS avec variables et mode nuit
├── js/
│   └── script.js       # Logique JavaScript complète
├── assets/             # Dossier pour les ressources (vide)
└── README.md           # Documentation
```

## 🎯 Fonctionnalités Techniques

### API Integration
- **Endpoint** : `https://image.pollinations.ai/prompt/{prompt}`
- **Paramètres** : width, height, seed=-1, model=flux
- **Méthode** : GET avec fetch() et async/await
- **Gestion des erreurs** : Status HTTP, timeout, validation d'image

### Sanitisation des Entrées
- Suppression des caractères HTML dangereux (`<>\"'&`)
- Suppression des caractères de structure (`{}[]`)
- Limitation à 500 caractères maximum
- Encodage URL approprié

### Stockage Local
- **Historique** : `ai-image-generator-history`
- **Mode nuit** : `ai-image-generator-night-mode`
- **Gestion des erreurs** de stockage avec fallback

### Responsive Design
- **Breakpoints** : 768px (tablette), 480px (mobile)
- **Grid CSS** pour l'historique et les options
- **Flexbox** pour les layouts complexes
- **Unités relatives** (rem, %, vw/vh)

## 🎨 Personnalisation

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

### Prompts Structurés
Modifiez le tableau `structuredPrompts` dans `script.js` pour ajouter vos propres prompts :

```javascript
const structuredPrompts = [
    "Votre nouveau prompt personnalisé...",
    // Ajoutez d'autres prompts ici
];
```

## 🔧 Configuration

### Paramètres API
Modifiez la configuration dans `script.js` :

```javascript
const CONFIG = {
    API_BASE_URL: 'https://image.pollinations.ai/prompt',
    MAX_HISTORY: 5,
    STORAGE_KEY: 'ai-image-generator-history',
    NIGHT_MODE_KEY: 'ai-image-generator-night-mode'
};
```

## 🌐 Compatibilité

### Navigateurs Supportés
- **Chrome/Chromium** 80+
- **Firefox** 75+
- **Safari** 13+
- **Edge** 80+

### Fonctionnalités Requises
- ES6+ (async/await, const/let, arrow functions)
- Fetch API
- CSS Grid et Flexbox
- CSS Custom Properties (variables)
- LocalStorage

## 🐛 Dépannage

### Problèmes Courants

**L'image ne se génère pas :**
- Vérifiez votre connexion internet
- Le service Pollinations AI peut être temporairement indisponible
- Essayez avec un prompt plus simple

**Le mode nuit ne se sauvegarde pas :**
- Vérifiez que le LocalStorage est activé dans votre navigateur
- Certains navigateurs en mode privé limitent le stockage local

**L'historique ne s'affiche pas :**
- Videz le cache du navigateur
- Vérifiez la console pour les erreurs JavaScript

### Messages d'Erreur
- **"Erreur HTTP 502"** : Service temporairement indisponible
- **"Problème de connexion"** : Vérifiez votre connexion internet
- **"La génération a pris trop de temps"** : Timeout de 30 secondes dépassé

## 📝 Licence

Ce projet est fourni à des fins éducatives et de démonstration. L'API Pollinations AI a ses propres conditions d'utilisation.

## 🤝 Contribution

Pour améliorer ce projet :
1. Testez sur différents navigateurs et appareils
2. Signalez les bugs via les outils de développement
3. Proposez des améliorations d'interface utilisateur
4. Optimisez les performances et l'accessibilité

---

**Développé avec ❤️ en HTML, CSS et JavaScript vanilla**

