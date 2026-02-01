import Link from 'next/link';
import { Github } from 'lucide-react';

const footerLinks = {
  resources: [
    { label: 'Documentation', href: '/docs' },
    { label: 'Specifications', href: '/specs' },
    { label: 'GitHub', href: 'https://github.com/originlabs-app/galileo-luxury-standard', external: true },
  ],
  governance: [
    { label: 'Governance', href: '/governance' },
    { label: 'TSC Charter', href: '/governance/tsc' },
    { label: 'Contributing', href: '/docs/contributing' },
  ],
  legal: [
    { label: 'License (Apache 2.0)', href: '/license' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[rgba(229,229,229,0.08)] bg-[#050505]">
      <div className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Logo Column */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#B8973A] flex items-center justify-center">
                <span className="text-[#050505] font-serif font-bold text-lg">G</span>
              </div>
              <span className="font-serif text-xl font-medium text-[#E5E5E5]">
                GALILEO
              </span>
            </Link>
            <p className="text-[#A3A3A3] text-sm mb-4">
              The open standard for luxury product authenticity and compliance.
            </p>
            <a
              href="https://github.com/originlabs-app/galileo-luxury-standard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#A3A3A3] hover:text-[#E5E5E5] transition-colors"
            >
              <Github className="w-5 h-5" />
              <span className="text-sm">Star on GitHub</span>
            </a>
          </div>

          {/* Resources Column */}
          <div>
            <h4 className="text-[#E5E5E5] font-sans font-medium mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#A3A3A3] hover:text-[#E5E5E5] text-sm transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-[#A3A3A3] hover:text-[#E5E5E5] text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Governance Column */}
          <div>
            <h4 className="text-[#E5E5E5] font-sans font-medium mb-4">Governance</h4>
            <ul className="space-y-3">
              {footerLinks.governance.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#A3A3A3] hover:text-[#E5E5E5] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="text-[#E5E5E5] font-sans font-medium mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#A3A3A3] hover:text-[#E5E5E5] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-[rgba(229,229,229,0.08)] mt-12 pt-8 text-center">
          <p className="text-[#A3A3A3] text-sm">
            {new Date().getFullYear()} Galileo Luxury Standard. Licensed under Apache 2.0.
          </p>
        </div>
      </div>
    </footer>
  );
}
