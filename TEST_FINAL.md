# 🎯 TEST FINAL - Chapters

## ✅ Ce qui est prêt

1. **Serveur Next.js** : http://localhost:3000
2. **Base de données** : Supabase PostgreSQL connectée
3. **Edge Functions** : Déployées sur Supabase (backup)
4. **Secrets** : Tous configurés dans Supabase Vault
5. **Modèle** : GPT-4 Turbo (support JSON)
6. **Prompts** : Identiques au n8n.json

## 🧪 Test 1 : Via Telegram

### Étapes :
1. Assurez-vous que **ngrok** tourne :
   ```bash
   ngrok http 3000
   ```

2. Ouvrez Telegram et allez sur **@chaptersapp_bot**

3. Envoyez un message :
   - 🎙️ **Vocal** : "L'histoire d'un athlète qui n'abandonne jamais"
   - ✍️ **Texte** : "Un coureur qui court son premier marathon à 50 ans"

### Ce qui va se passer :
```
1. 🎙️ Transcription (si vocal) - ~5s
2. 📝 Génération Scénario - ~15s  
3. 🖼️ Génération Image Prompts - ~10s
4. 📜 Génération Script - ~10s
5. 🔧 Normalisation - ~5s
6. 🎨 Génération Images (10 images) - ~90s
7. 🎵 Génération Audio (10 clips) - ~60s
8. ✅ Envoi sur Telegram

Total: 2-5 minutes
```

### Surveiller les logs :
```bash
# Terminal 1 : Logs du serveur
npm run dev

# Terminal 2 : Polling de la queue
watch -n 2 'curl -s http://localhost:3000/api/queue | jq'
```

## 🧪 Test 2 : Via Interface Web

1. **Ouvrez** : http://localhost:3000

2. **Entrez un concept** :
   ```
   L'histoire d'un athlète qui surmonte l'impossible
   ```

3. **Cliquez** sur "Write the Chapter"

4. **Surveillez** via le bouton **Q** (en haut à droite)

## 📊 Configuration Actuelle

| Composant | Status | Détails |
|-----------|--------|---------|
| **OpenAI** | ✅ | GPT-4 Turbo (scenario, script, image prompts) |
| **OpenAI** | ✅ | GPT-3.5 Turbo (normalisation) |
| **OpenAI** | ✅ | Whisper (transcription) |
| **Fal.ai** | ✅ | Flux Pro v1.1-ultra (9:16) |
| **ElevenLabs** | ✅ | Voice ID n8n |
| **Supabase** | ✅ | PostgreSQL + Edge Functions |
| **Telegram** | ✅ | @chaptersapp_bot |

## 🔍 Debug

Si erreur, vérifiez :

```bash
# 1. Logs du serveur Next.js
tail -f .next/trace

# 2. Logs Supabase Edge Functions
supabase functions logs generate-scenario --project-ref mkjvatqtcswskxtqppnt

# 3. Base de données
npx prisma studio
```

## 🎯 Résultat Attendu

Après 2-5 minutes :
- ✅ 10-15 images générées (9:16, style n8n)
- ✅ 10-15 clips audio (voix n8n)
- ✅ Carousel complet sur Telegram
- ✅ Lien vers le Studio pour édition

---

**LANCEZ LE TEST MAINTENANT !** 🚀
