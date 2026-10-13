import { motion } from 'framer-motion';
import { Mail, MessageCircle, Github, Instagram, Linkedin, ArrowUpRight } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7 },
};

const contactLinks = [
  {
    label: 'Email',
    value: 'mohabelsanhory@gmail.com',
    href: 'mailto:mohabelsanhory@gmail.com',
    icon: Mail,
    desc: 'Drop me an email',
  },
  {
    label: 'WhatsApp',
    value: '+20 128 904 8476',
    href: 'https://wa.me/201289048476',
    icon: MessageCircle,
    desc: 'Quick chat on WhatsApp',
  },
  {
    label: 'Instagram',
    value: '@mohabweb101',
    href: 'https://www.instagram.com/mohabweb101/',
    icon: Instagram,
    desc: 'Follow my work',
  },
  {
    label: 'GitHub',
    value: 'Mohabweb',
    href: 'https://github.com/Mohabweb',
    icon: Github,
    desc: 'Check out my code',
  },
  {
    label: 'LinkedIn',
    value: 'Mohab Elsanhory',
    href: 'https://www.linkedin.com/in/mohab-elsanhory-46a030264/',
    icon: Linkedin,
    desc: 'Connect professionally',
  },
];

export default function Contact() {
  return (
    <section id="contact" className="relative py-32 lg:py-40 bg-dark">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent/[0.03] rounded-full blur-[150px]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left: CTA */}
          <motion.div {...fadeInUp}>
            <p className="font-body text-accent text-sm uppercase tracking-[0.3em] mb-4">Contact</p>
            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tighter-custom leading-[0.9]">
              Let's build
              <br />
              something
              <span className="text-accent">.</span>
            </h2>
            <p className="font-body text-muted text-base lg:text-lg mt-8 max-w-md leading-relaxed">
              Have a project in mind? Need a website for your business? Or just want to say hi? I'd love to hear from you.
            </p>

            <motion.a
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.2 }}
              href="mailto:mohabelsanhory@gmail.com"
              className="group inline-flex items-center gap-3 mt-10 px-10 py-4 bg-accent hover:bg-accent-hover text-white font-body text-base font-medium rounded-full transition-all duration-300"
            >
              Start a Project
              <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </motion.a>
          </motion.div>

          {/* Right: Contact links */}
          <div className="space-y-4">
            {contactLinks.map((link, i) => (
              <motion.a
                key={link.label}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: i * 0.1 }}
                className="group flex items-center gap-6 p-6 bg-dark-50 border border-white/5 rounded-2xl hover:border-accent/20 transition-all duration-500"
              >
                <div className="p-3 bg-accent/10 rounded-xl group-hover:bg-accent/20 transition-colors duration-300">
                  <link.icon size={20} className="text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-xs uppercase tracking-widest text-muted mb-1">{link.label}</p>
                  <p className="font-display text-lg font-semibold text-white truncate">{link.value}</p>
                  <p className="font-body text-sm text-muted/60 mt-0.5">{link.desc}</p>
                </div>
                <ArrowUpRight
                  size={18}
                  className="text-white/10 group-hover:text-accent group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300 shrink-0"
                />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
