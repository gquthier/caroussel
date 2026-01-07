# Guide de Test Complet - Chapters

## 🎯 État Actuel

✅ **Configuration OpenAI** : Utilise GPT-4 avec votre clé
✅ **Prompts n8n** : Identiques aux originaux
✅ **Base de données** : Supabase PostgreSQL
✅ **Telegram Bot** : Webhook configuré
✅ **Queue & Historique** : Table QueueHistory active

---

## 🧪 Test 1 : Via Telegram (Recommandé)

### Prérequis
1. **Serveur Next.js** : `npm run dev` (port 3000)
2. **ngrok** : `ngrok http 3000`
3. **Webhook configuré** : Utilisez `./CONFIGURE_TELEGRAM.sh`

### Étapes de Test

1. **Ouvrez Telegram**
   - Cherchez `@chaptersapp_bot`
   - Envoyez `/start`

2. **Envoyez un message**
   
   **Option A - Message vocal** (10-20 secondes) :
   - Enregistrez : *"Un athlète ordinaire qui court son premier marathon"*
   - Le bot transcrit avec Whisper

   **Option B - Message texte** :
   ```
   L'histoire d'un coureur qui n'abandonne jamais son rêve
   ```

3. **Progression attendue** (sur Telegram) :
   ```
   🎙 Transcription en cours...
   📝 Transcription: [votre texte]
   🎬 Génération du carousel en cours...
   ✅ Scénario créé: "Titre"
   🎨 Génération de X images...
   ⏳ 3/X slides générées...
   ⏳ 6/X slides générées...
   🎉 Carousel terminé !
   ```

4. **Résultat attendu** :
   - Images envoyées en groupe sur Telegram
   - Lien vers le Studio
   - Projet visible dans Supabase

### Surveillance des Logs

**Terminal 1 - Serveur** :
```bash
npm run dev
```

**Terminal 2 - Logs en direct** :
```bash
# Voir les logs du processus
tail -f .next/trace

# Ou suivre les logs Next.js
npm run dev | grep -E "POST|Error|Generating"
```

### Erreurs Possibles

| Erreur | Cause | Solution |
|--------|-------|----------|
| `404 Webhook not found` | ngrok arrêté | Relancer ngrok + reconfigurer webhook |
| `400 JSON error` | Prompt manquant | Vérifié et corrigé ✅ |
| `Transcription failed` | Mauvais format audio | Telegram envoie en .ogg (supporté) |
| `Image generation timeout` | Fal.ai lent | Normal, 30-60s par image |

---

## 🧪 Test 2 : Via Interface Web

### Prérequis
1. **Serveur Next.js** : `npm run dev` (port 3000)

### Étapes de Test

1. **Ouvrez le navigateur**
   - URL : http://localhost:3000

2. **Entrez un concept**
   ```
   L'histoire d'un athlète qui surmonte l'impossible
   ```

3. **Cliquez sur "Write the Chapter"**

4. **Surveillez la progression**
   - Cliquez sur le bouton **Q** (en haut à droite)
   - Vous verrez :
     - Progression en temps réel
     - Nombre d'images générées
     - Nombre d'audios générés
     - Statut de chaque slide

5. **Résultat attendu**
   - Redirection vers `/studio/[projectId]`
   - Images visibles dans le canvas
   - Audio disponible pour chaque slide
   - Édition possible

### Timeline Attendue

```
0s    - Génération du scénario (GPT-4)         ~10-15s
15s   - Génération des prompts d'images (GPT-4) ~10s
25s   - Génération du script (GPT-4)            ~10s
35s   - Normalisation du script (GPT-3.5)       ~5s
40s   - Génération des images (Fal.ai)          ~30-60s par batch de 3
120s  - Génération de l'audio (ElevenLabs)      ~10-20s par slide
180s  - ✅ Terminé
```

**Total** : 2-5 minutes selon le nombre de slides

---

## 🔍 Vérification dans Supabase

### 1. Voir les Projets

https://supabase.com/dashboard/project/mkjvatqtcswskxtqppnt/editor

**Table `Project`** :
- ✅ Nouveau projet créé
- ✅ `telegramChatId` rempli (si vient de Telegram)
- ✅ `status` = "generating" puis "completed"

**Table `Slide`** :
- ✅ 10-15 slides créées
- ✅ `imageStatus` : pending → generating → completed
- ✅ `audioStatus` : pending → generating → completed

**Table `QueueHistory`** :
- ✅ Entrées pour chaque étape :
  - transcription
  - scenario
  - image_prompts
  - script
  - normalization
  - images
  - audio
  - completed

### 2. Requête SQL de Vérification

```sql
-- Voir le dernier projet avec son historique
SELECT 
  p.id,
  p.title,
  p.status,
  p."telegramChatId",
  COUNT(s.id) as slide_count,
  COUNT(CASE WHEN s."imageStatus" = 'completed' THEN 1 END) as images_done,
  COUNT(CASE WHEN s."audioStatus" = 'completed' THEN 1 END) as audio_done
FROM "Project" p
LEFT JOIN "Slide" s ON s."projectId" = p.id
GROUP BY p.id
ORDER BY p."createdAt" DESC
LIMIT 1;

-- Voir l'historique de la queue
SELECT 
  qh.stage,
  qh.status,
  qh.message,
  qh."startedAt",
  qh."completedAt"
FROM "QueueHistory" qh
WHERE qh."projectId" = 'VOTRE_PROJECT_ID'
ORDER BY qh."startedAt" ASC;
```

---

## 📊 Checklist de Test Complet

### Avant de Tester
- [ ] Serveur Next.js lancé (port 3000)
- [ ] ngrok lancé et webhook configuré (pour Telegram)
- [ ] Clés API configurées dans `.env`
- [ ] Base de données Supabase connectée

### Test Telegram
- [ ] Message vocal reçu et transcrit
- [ ] Message texte reçu et traité
- [ ] Progression affichée sur Telegram
- [ ] Images générées et envoyées
- [ ] Lien Studio fonctionnel
- [ ] Projet visible dans Supabase

### Test Interface Web
- [ ] Page d'accueil charge
- [ ] Formulaire fonctionne
- [ ] Bouton Q affiche la queue
- [ ] Redirection vers Studio
- [ ] Images visibles dans le canvas
- [ ] Audio jouable
- [ ] Édition de texte fonctionne
- [ ] Toggle caption fonctionne
- [ ] Download PNG fonctionne

### Vérifications Supabase
- [ ] Projet créé dans la table `Project`
- [ ] Slides créés dans la table `Slide`
- [ ] Historique dans `QueueHistory`
- [ ] Statuts corrects (completed)

---

## 🐛 Debug - Commandes Utiles

### Voir les logs en temps réel
```bash
# Logs du serveur
npm run dev

# Voir un PID spécifique
tail -f /proc/PID/fd/1  # Linux
```

### Tester les API Routes manuellement
```bash
# Test génération (sans Telegram)
curl -X POST http://localhost:3000/api/projects/generate \
  -H "Content-Type: application/json" \
  -d '{"concept": "Test story"}'

# Test queue
curl http://localhost:3000/api/queue

# Test historique
curl http://localhost:3000/api/history?limit=5
```

### Réinitialiser si nécessaire
```bash
# Killer tous les processus Next.js
kill $(lsof -ti:3000)

# Vider le cache Next.js
rm -rf .next

# Relancer
npm run dev
```

---

## ✅ Succès Attendu

**Telegram** :
- ✅ Transcription instantanée
- ✅ Carousel complet en 2-5 min
- ✅ Images de qualité (720x1280)
- ✅ Audio synchronisé

**Interface Web** :
- ✅ Génération fluide
- ✅ Bouton Q montre la progression
- ✅ Studio fonctionnel
- ✅ Export JSON disponible

**Supabase** :
- ✅ Données persistées
- ✅ Historique complet
- ✅ Statuts à jour

---

## 📞 Support

En cas d'erreur, vérifiez dans cet ordre :

1. **Logs du serveur** (`npm run dev`)
2. **Table `QueueHistory`** dans Supabase (quel stage a échoué ?)
3. **Clés API** (`.env` correctement configuré ?)
4. **Webhook Telegram** (ngrok toujours actif ?)

---

**Prêt à tester ! Envoyez votre premier message sur @chaptersapp_bot maintenant !** 🚀
