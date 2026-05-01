import { Github, Twitter, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>by IPCheck Team</span>
          </div>
          
          <div className="flex items-center gap-6">
            <a 
              href="https://github.com/jason5ng32/MyIP" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span className="text-sm">GitHub</span>
            </a>
            <a 
              href="#" 
              className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <Twitter className="w-4 h-4" />
              <span className="text-sm">Twitter</span>
            </a>
          </div>
          
          <p className="text-slate-500 text-sm">
            © 2024 IPCheck Tool. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
