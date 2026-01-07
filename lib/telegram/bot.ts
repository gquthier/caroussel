/**
 * Telegram Bot Integration
 * Gère les messages vocaux et l'envoi de carousels
 */

import axios from 'axios';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    first_name: string;
    username?: string;
  };
  chat: {
    id: number;
    type: string;
  };
  text?: string;
  voice?: {
    file_id: string;
    file_unique_id: string;
    duration: number;
    mime_type: string;
    file_size: number;
  };
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

/**
 * Récupère le fichier audio d'un message vocal Telegram
 */
export async function getVoiceFile(fileId: string): Promise<Buffer> {
  try {
    // 1. Get file path
    const fileResponse = await axios.get(`${TELEGRAM_API}/getFile`, {
      params: { file_id: fileId }
    });

    const filePath = fileResponse.data.result.file_path;

    // 2. Download file
    const downloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
    const audioResponse = await axios.get(downloadUrl, {
      responseType: 'arraybuffer'
    });

    return Buffer.from(audioResponse.data);
  } catch (error) {
    console.error('Error getting voice file:', error);
    throw new Error('Failed to download voice message');
  }
}

/**
 * Envoie un message texte à un chat Telegram
 */
export async function sendMessage(chatId: number, text: string): Promise<void> {
  try {
    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: text,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    throw new Error('Failed to send message');
  }
}

/**
 * Envoie un fichier audio à Telegram
 * Accepte soit un Buffer, soit une URL (data URL ou URL HTTP)
 */
export async function sendAudio(
  chatId: number,
  audio: Buffer | string,
  caption?: string
): Promise<void> {
  try {
    // Si c'est une data URL (base64), on la convertit en Buffer
    let audioBuffer: Buffer;
    if (typeof audio === 'string') {
      if (audio.startsWith('data:audio')) {
        // Data URL: data:audio/mpeg;base64,...
        const base64Data = audio.split(',')[1];
        audioBuffer = Buffer.from(base64Data, 'base64');
      } else if (audio.startsWith('http')) {
        // URL HTTP: télécharger d'abord
        const response = await axios.get(audio, { responseType: 'arraybuffer' });
        audioBuffer = Buffer.from(response.data);
      } else {
        throw new Error('Invalid audio format: must be Buffer, data URL, or HTTP URL');
      }
    } else {
      audioBuffer = audio;
    }

    const formData = new FormData();
    formData.append('chat_id', chatId.toString());
    formData.append('audio', new Blob([new Uint8Array(audioBuffer)], { type: 'audio/mpeg' }), 'voiceover.mp3');
    if (caption) {
      formData.append('caption', caption);
    }

    await axios.post(`${TELEGRAM_API}/sendAudio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } catch (error) {
    console.error('Error sending audio:', error);
    throw new Error('Failed to send audio');
  }
}

/**
 * Envoie une photo à Telegram
 */
export async function sendPhoto(
  chatId: number,
  photoUrl: string,
  caption?: string
): Promise<void> {
  try {
    await axios.post(`${TELEGRAM_API}/sendPhoto`, {
      chat_id: chatId,
      photo: photoUrl,
      caption: caption || '',
    });
  } catch (error) {
    console.error('Error sending photo:', error);
    throw new Error('Failed to send photo');
  }
}

/**
 * Envoie un groupe de médias (carousel) à Telegram
 */
export async function sendMediaGroup(
  chatId: number,
  imageUrls: string[],
  caption?: string
): Promise<void> {
  try {
    const media = imageUrls.map((url, index) => ({
      type: 'photo',
      media: url,
      ...(index === 0 && caption ? { caption } : {})
    }));

    await axios.post(`${TELEGRAM_API}/sendMediaGroup`, {
      chat_id: chatId,
      media: media,
    });
  } catch (error) {
    console.error('Error sending media group:', error);
    throw new Error('Failed to send media group');
  }
}

/**
 * Configure le webhook Telegram
 */
export async function setWebhook(webhookUrl: string): Promise<void> {
  try {
    await axios.post(`${TELEGRAM_API}/setWebhook`, {
      url: webhookUrl,
      allowed_updates: ['message'],
    });
    console.log('Telegram webhook set to:', webhookUrl);
  } catch (error) {
    console.error('Error setting webhook:', error);
    throw new Error('Failed to set webhook');
  }
}

/**
 * Supprime le webhook Telegram
 */
export async function deleteWebhook(): Promise<void> {
  try {
    await axios.post(`${TELEGRAM_API}/deleteWebhook`);
    console.log('Telegram webhook deleted');
  } catch (error) {
    console.error('Error deleting webhook:', error);
  }
}
