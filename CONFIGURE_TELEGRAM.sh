#!/bin/bash

# Script de configuration du webhook Telegram
# Configuration pour environnement public (Vercel / domaine) - sans ngrok

echo "🚀 Configuration du Webhook Telegram pour Chapters"
echo "=================================================="
echo ""

# Variables requises
if [ -z "$TELEGRAM_BOT_TOKEN" ]; then
    echo "❌ TELEGRAM_BOT_TOKEN n'est pas défini (variable d'env)"
    echo "   Exemple: export TELEGRAM_BOT_TOKEN=123:ABC..."
    exit 1
fi

echo "✅ TELEGRAM_BOT_TOKEN est défini"
echo ""

# Instructions
echo "📋 ÉTAPES À SUIVRE:"
echo ""
echo "1. Récupérez l'URL publique de votre app (Vercel ou domaine)"
echo "   Ex: https://caroussel.vercel.app"
echo ""
echo "2. Collez l'URL ci-dessous et appuyez sur Entrée"
echo ""

read -p "URL publique (avec https://): " PUBLIC_BASE_URL

if [ -z "$PUBLIC_BASE_URL" ]; then
    echo "❌ URL vide, annulation"
    exit 1
fi

# Enlever le / final si présent
PUBLIC_BASE_URL=${PUBLIC_BASE_URL%/}

echo ""
echo "🔧 Configuration du webhook..."
echo ""

# Configurer le webhook
WEBHOOK_URL="${PUBLIC_BASE_URL}/api/telegram/webhook"
BOT_TOKEN="$TELEGRAM_BOT_TOKEN"

RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"${WEBHOOK_URL}\"}")

echo "📡 Réponse Telegram:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Vérifier le webhook
echo "🔍 Vérification du webhook..."
echo ""

WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo")
echo "$WEBHOOK_INFO" | jq '.' 2>/dev/null || echo "$WEBHOOK_INFO"
echo ""

# Instructions finales
if echo "$RESPONSE" | grep -q "\"ok\":true"; then
    echo "✅ Webhook configuré avec succès!"
    echo ""
    echo "🎉 Configuration terminée!"
    echo ""
    echo "📱 TESTEZ MAINTENANT:"
    echo "1. Ouvrez Telegram"
    echo "2. Cherchez @chaptersapp_bot"
    echo "3. Envoyez /start"
    echo "4. Envoyez un message vocal ou texte"
    echo ""
    echo "🔗 Webhook URL: ${WEBHOOK_URL}"
    echo ""
    echo "ℹ️  IMPORTANT: le webhook pointe désormais vers votre URL publique (Vercel/domaine)."
else
    echo "❌ Erreur lors de la configuration"
    echo "   Vérifiez que l'URL est correcte et que le déploiement est accessible publiquement"
fi
