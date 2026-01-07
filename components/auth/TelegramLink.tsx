'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Send } from 'lucide-react';
import axios from 'axios';

export function TelegramLink() {
  const [open, setOpen] = useState(false);
  const [telegramId, setTelegramId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLink = async () => {
    if (!telegramId) return;

    setLoading(true);
    try {
      await axios.post('/api/auth/telegram', {
        telegramId: parseInt(telegramId),
        telegramUsername: `user_${telegramId}`,
        email: email || undefined,
      });

      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Error linking Telegram:', error);
      alert('Erreur lors de la liaison Telegram');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Send className="w-4 h-4 mr-2" />
          Connecter Telegram
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connecter votre compte Telegram</DialogTitle>
          <DialogDescription>
            Recevez des notifications en temps réel sur Telegram quand vos carousels sont prêts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="telegram-id">Telegram ID</Label>
            <Input
              id="telegram-id"
              type="number"
              value={telegramId}
              onChange={(e) => setTelegramId(e.target.value)}
              placeholder="123456789"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Envoyez /start à @chaptersapp_bot pour obtenir votre ID
            </p>
          </div>

          <div>
            <Label htmlFor="email">Email (optionnel)</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
            />
          </div>

          <Button
            onClick={handleLink}
            disabled={loading || !telegramId}
            className="w-full"
          >
            {loading ? 'Connexion...' : success ? '✓ Connecté !' : 'Connecter'}
          </Button>

          <div className="bg-canvas p-3 rounded-lg text-sm">
            <p className="font-semibold mb-2">Comment obtenir votre Telegram ID ?</p>
            <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
              <li>Ouvrez Telegram</li>
              <li>Cherchez @chaptersapp_bot</li>
              <li>Envoyez /start</li>
              <li>Le bot vous donnera votre ID</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
