# Changelog - Chapters

## Version 1.1.0 - Améliorations UX (2026-01-06)

### ✅ Fonctionnalités Ajoutées

#### 1. **Toggle Captions** 
- Bouton 👁️ (Eye/EyeOff) pour afficher/masquer les captions sur l'image
- État persistant dans la base de données (champ `showCaption`)
- Les captions sont désormais optionnelles et ne s'affichent que si activées

#### 2. **Téléchargement PNG Direct**
- Bouton ⬇️ Download sur chaque slide dans le canvas
- Télécharge l'image générée directement en PNG
- Nom de fichier automatique : `slide-1.png`, `slide-2.png`, etc.

#### 3. **Upload d'Images Personnalisées**
- Upload de fichiers PNG, JPG, WEBP (max 10MB)
- Remplacement instantané de l'image générée par l'IA
- Conversion automatique en base64 pour stockage
- Interface intuitive dans le panneau AI Controls

#### 4. **Captions Non-Générées par Défaut**
- Les captions ne sont plus ajoutées automatiquement sur les images par Fal.ai
- L'overlay de texte est géré côté frontend uniquement
- Plus de contrôle sur l'apparence finale

#### 5. **Contrôles Améliorés**
- 3 boutons flottants sur le canvas :
  - 👁️ Toggle caption
  - ⬇️ Download image
  - ▶️ Play audio
- Interface plus intuitive et accessible

### 🔧 Corrections Techniques

- Base de données SQLite avec nouveau champ `showCaption`
- API PATCH étendue pour gérer `showCaption` et `imageUrl`
- Gestion correcte des images base64 uploadées
- Support DeepSeek au lieu d'OpenAI

### 📦 Nouveau Schéma Base de Données

```prisma
model Slide {
  showCaption   Boolean  @default(true)  // Nouveau champ
  imageUrl      String?                   // Accepte maintenant base64
  // ... autres champs
}
```

### 🎯 URL de l'Application

**Serveur local** : http://localhost:3000

### 🚀 Prochaines Étapes Suggérées

- [ ] Export MP4 avec FFmpeg
- [ ] Export ZIP avec tous les assets
- [ ] Authentification utilisateur
- [ ] Galerie de projets sauvegardés
- [ ] Drag & drop pour réorganiser les slides
- [ ] Templates pré-configurés
