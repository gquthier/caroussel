import { StoryTrigger } from '@/components/home/StoryTrigger';
import { TelegramLink } from '@/components/auth/TelegramLink';
import { BookOpen, History } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="border-b border-stone bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-terracotta flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-anthracite">Chapters</h1>
          </div>
          
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/history" className="flex items-center gap-2 text-muted-foreground hover:text-anthracite transition-colors">
              <History className="w-4 h-4" />
              Historique
            </Link>
            <TelegramLink />
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main>
        <StoryTrigger />
      </main>

      {/* Footer */}
      <footer className="border-t border-stone bg-white mt-24">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-terracotta flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-serif text-xl font-bold">Chapters</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered storytelling for the social media age
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-anthracite transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-anthracite transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-anthracite transition-colors">Examples</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-anthracite transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-anthracite transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-anthracite transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-anthracite transition-colors">About</a></li>
                <li><a href="#" className="hover:text-anthracite transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-anthracite transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-stone text-center text-sm text-muted-foreground">
            <p>&copy; 2026 Chapters. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
