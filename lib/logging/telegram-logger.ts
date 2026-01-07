/**
 * Service de logging automatique vers Telegram
 * Envoie tous les logs de génération vers le chat Telegram approprié
 */

import { sendMessage } from '@/lib/telegram/bot';

interface LogContext {
  projectId?: string;
  chatId?: number;
  userId?: string;
  stage?: string;
}

class TelegramLogger {
  private logQueue: Array<{ chatId: number; message: string }> = [];
  private isProcessing = false;
  private currentContext: LogContext = {};
  private adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID ? parseInt(process.env.TELEGRAM_ADMIN_CHAT_ID) : null;
  private masterLogsChatId: number;

  constructor() {
    // Chat ID du groupe pour TOUS les logs
    this.masterLogsChatId = parseInt(process.env.TELEGRAM_LOGS_CHAT_ID || '0');
  }

  /**
   * Définir le contexte actuel (chat ID, user ID, etc.)
   */
  setContext(context: LogContext) {
    this.currentContext = { ...this.currentContext, ...context };
  }

  /**
   * Effacer le contexte
   */
  clearContext() {
    this.currentContext = {};
  }

  /**
   * Logger un message (sera envoyé sur Telegram si chatId disponible)
   */
  async log(message: string, emoji?: string) {
    const fullMessage = emoji ? `${emoji} ${message}` : message;
    
    // Log dans la console
    console.log(`[TelegramLogger] ${fullMessage}`);

    // TOUJOURS envoyer vers le groupe de logs master
    if (this.masterLogsChatId) {
      this.queueMessage(this.masterLogsChatId, fullMessage);
    }

    // Si on a un chat ID spécifique (pour l'utilisateur), envoyer aussi là
    if (this.currentContext.chatId && this.currentContext.chatId !== this.masterLogsChatId) {
      this.queueMessage(this.currentContext.chatId, fullMessage);
    }
  }

  /**
   * Log d'information
   */
  async info(message: string) {
    await this.log(message, 'ℹ️');
  }

  /**
   * Log de succès
   */
  async success(message: string) {
    await this.log(message, '✅');
  }

  /**
   * Log de progression
   */
  async progress(message: string) {
    await this.log(message, '⏳');
  }

  /**
   * Log d'erreur
   */
  async error(message: string, error?: Error) {
    const errorMessage = error ? `${message}: ${error.message}` : message;
    await this.log(errorMessage, '❌');
  }

  /**
   * Log de stage (étapes du workflow)
   */
  async stage(stageName: string, message: string) {
    const stageEmojis: Record<string, string> = {
      transcription: '🎙️',
      scenario: '📝',
      rework: '✨',
      image_prompts: '🎨',
      script: '📜',
      normalization: '🔧',
      images: '🖼️',
      audio: '🎵',
      completed: '🎉',
    };

    const emoji = stageEmojis[stageName] || '📊';
    await this.log(`[${stageName.toUpperCase()}] ${message}`, emoji);
  }

  /**
   * Ajouter un message à la queue
   */
  private queueMessage(chatId: number, message: string) {
    this.logQueue.push({ chatId, message });
    this.processQueue();
  }

  /**
   * Traiter la queue de messages (évite les rate limits Telegram)
   */
  private async processQueue() {
    if (this.isProcessing || this.logQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.logQueue.length > 0) {
      const item = this.logQueue.shift();
      if (item) {
        try {
          await sendMessage(item.chatId, item.message);
          // Petit délai pour éviter rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error('Error sending log to Telegram:', error);
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * Logger un résumé de génération
   */
  async summary(data: {
    title: string;
    totalSlides: number;
    completedImages: number;
    completedAudio: number;
    duration?: number;
  }) {
    const message = 
      `📊 Résumé de la génération:\n\n` +
      `📱 Titre: ${data.title}\n` +
      `🖼️ Images: ${data.completedImages}/${data.totalSlides}\n` +
      `🎵 Audio: ${data.completedAudio}/${data.totalSlides}\n` +
      (data.duration ? `⏱️ Durée: ${Math.round(data.duration / 1000)}s\n` : '');

    await this.log(message);
  }
}

// Instance singleton
export const telegramLogger = new TelegramLogger();
