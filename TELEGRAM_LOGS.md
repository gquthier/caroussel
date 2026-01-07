# Système de Logging Automatique Telegram

## 🎯 Fonctionnement

**Tous les logs de l'application sont automatiquement envoyés vers Telegram**, peu importe d'où vient la génération (Desktop ou Telegram).

---

## 📊 Ce qui est envoyé automatiquement

### **Lors d'une génération depuis Telegram :**

```
ℹ️ 🎬 Démarrage de la génération...
📝 [SCENARIO] Génération du scénario initial...
✅ Scénario initial généré
✨ [REWORK] Application de la VIRAL SAUCE (optimisation)...
✅ Scénario optimisé pour la viralité
🎨 [IMAGE_PROMPTS] Génération des prompts d'images...
✅ 12 prompts visuels créés
📜 [SCRIPT] Rédaction du script voiceover...
✅ Script voiceover généré
🔧 [NORMALIZATION] Normalisation du script...
✅ Script normalisé et prêt
✅ Projet créé: "Titre du projet"
🖼️ [IMAGES] Génération de 12 images (batch de 3)...
⏳ 3/12 slides générées
⏳ 6/12 slides générées
⏳ 9/12 slides générées
⏳ 12/12 slides générées
📊 Résumé de la génération:

📱 Titre: Titre du projet
🖼️ Images: 12/12
🎵 Audio: 12/12
⏱️ Durée: 245s

✅ Carousel terminé ! 🎉
🔗 http://localhost:3000/studio/clx123abc
```

### **Lors d'une génération depuis Desktop :**

Les mêmes logs sont envoyés si l'utilisateur a connecté son Telegram (via le bouton "Connecter Telegram").

---

## 🔧 Architecture

```
┌─────────────────────────────────────┐
│   Génération (Desktop ou Telegram)  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     TelegramLogger (Singleton)      │
│  - setContext(chatId)               │
│  - log(), success(), error(), etc.  │
│  - Queue de messages (rate limit)   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Telegram Bot API               │
│  - sendMessage(chatId, message)     │
└─────────────────────────────────────┘
```

---

## 📝 Niveaux de Logs

| Méthode | Emoji | Usage |
|---------|-------|-------|
| `info()` | ℹ️ | Informations générales |
| `success()` | ✅ | Succès d'une étape |
| `progress()` | ⏳ | Progression |
| `error()` | ❌ | Erreurs |
| `stage()` | 📊/🎨/📜/etc. | Étapes du workflow |
| `summary()` | 📊 | Résumé final |

---

## 🎯 Flow Complet Telegram

### **1. Depuis Telegram (Message Vocal/Texte)**

```typescript
// Le webhook Telegram reçoit le message
telegramLogger.setContext({ chatId });

// Tous les logs suivants sont envoyés vers ce chat
await telegramLogger.info('Démarrage...');
await telegramLogger.stage('scenario', 'Génération...');
// ... etc ...

// À la fin
telegramLogger.clearContext();
```

### **2. Depuis Desktop**

Si l'utilisateur est connecté via Telegram :
- Le système récupère automatiquement son `chatId`
- Tous les logs sont envoyés sur son Telegram

---

## 🧪 Test

### **Tester depuis Telegram :**

```
1. Ouvrez @chaptersapp_bot
2. Envoyez : "Un athlète qui court son premier marathon"
3. Observez tous les logs en temps réel sur Telegram
```

### **Tester depuis Desktop :**

```
1. Allez sur http://localhost:3000
2. Cliquez "Connecter Telegram" et entrez votre ID
3. Créez un carousel
4. Recevez tous les logs sur Telegram
```

---

## 💡 Avantages

✅ **Transparence totale** : Vous voyez exactement ce qui se passe  
✅ **Debugging facile** : Les erreurs sont envoyées directement  
✅ **Pas de polling** : Pas besoin de rafraîchir une page  
✅ **Multi-plateforme** : Fonctionne depuis Desktop et Telegram  
✅ **Rate limit géré** : Queue de messages pour éviter les limites Telegram  

---

## 🔐 Sécurité

- Chaque utilisateur ne reçoit **QUE ses propres logs**
- Le `chatId` est automatiquement isolé par session
- Pas de fuites de logs entre utilisateurs

---

## 📊 Fichiers Créés

- `lib/logging/telegram-logger.ts` - Service de logging
- `TELEGRAM_LOGS.md` - Cette documentation

---

**🎉 Tous les logs sont maintenant automatiquement envoyés vers Telegram !**
