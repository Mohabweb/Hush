import { Github, Instagram, Linkedin, Mail, MessageCircle } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative py-12 bg-dark border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-display font-bold text-lg text-white tracking-tight-custom">
              MOHAB<span className="text-accent">.</span>
            </span>
            <p className="font-body text-xs text-muted">
              &copy; {currentYear} Mohab Elsanhory
            </p>
          </div>

          {/* Center */}
          <p className="font-body text-xs text-muted/60 text-center">
            Built with curiosity & code.
          </p>

          {/* Right: Social */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Mohabweb"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted hover:text-accent transition-colors"
              aria-label="GitHub"
            >
              <Github size={16} />
            </a>
            <a
              href="https://www.linkedin.com/in/mohab-elsanhory-46a030264/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted hover:text-accent transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={16} />
            </a>
            <a
              href="https://www.instagram.com/mohabweb101/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted hover:text-accent transition-colors"
              aria-label="Instagram"
            >
              <Instagram size={16} />
            </a>
            <a
              href="mailto:mohabelsanhory@gmail.com"
              className="p-2 text-muted hover:text-accent transition-colors"
              aria-label="Email"
            >
              <Mail size={16} />
            </a>
            <a
              href="https://wa.me/201289048476"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted hover:text-accent transition-colors"
              aria-label="WhatsApp"
            >
              <MessageCircle size={16} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
