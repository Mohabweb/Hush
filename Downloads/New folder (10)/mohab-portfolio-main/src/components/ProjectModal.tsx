import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Github } from 'lucide-react';
import type { Project } from '@/data/projects';
import ProjectPreview from './ProjectPreview';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    if (!project) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          onClick={onClose}
          role="presentation"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0.15, duration: 0.6 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-dark-100 border border-white/10 rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-dark-50 border border-white/10 rounded-full hover:bg-accent/10 hover:border-accent/30 transition-all"
              aria-label="Close modal"
            >
              <X size={16} className="text-white" />
            </button>

            {/* Project image */}
            <div className="relative w-full aspect-video bg-dark-200 overflow-hidden rounded-t-2xl">
              <ProjectPreview project={project} compact />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-100 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="p-8 lg:p-10 space-y-8">
              {/* Header */}
              <div>
                <p className="font-body text-accent text-xs uppercase tracking-[0.3em] mb-2">
                  {project.subtitle}
                </p>
                <h3 id="project-modal-title" className="font-display text-3xl lg:text-4xl font-bold text-white tracking-tighter-custom">
                  {project.title}
                </h3>
              </div>

              {/* Overview */}
              <div>
                <h4 className="font-display text-sm font-semibold text-white uppercase tracking-widest mb-3">Overview</h4>
                <p className="font-body text-muted leading-relaxed">{project.overview}</p>
              </div>

              {/* Goal */}
              <div>
                <h4 className="font-display text-sm font-semibold text-white uppercase tracking-widest mb-3">Goal</h4>
                <p className="font-body text-muted leading-relaxed">{project.goal}</p>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-display text-sm font-semibold text-white uppercase tracking-widest mb-3">Features</h4>
                <ul className="space-y-2">
                  {project.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 font-body text-muted text-sm">
                      <span className="text-accent mt-1 text-xs">▸</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tech Stack */}
              <div>
                <h4 className="font-display text-sm font-semibold text-white uppercase tracking-widest mb-3">Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <span key={tech} className="px-3 py-1.5 text-xs font-body font-medium bg-accent/10 text-accent rounded-full">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Challenges */}
              <div>
                <h4 className="font-display text-sm font-semibold text-white uppercase tracking-widest mb-3">Challenges</h4>
                <p className="font-body text-muted leading-relaxed">{project.challenges}</p>
              </div>

              {/* What I Learned */}
              <div>
                <h4 className="font-display text-sm font-semibold text-white uppercase tracking-widest mb-3">What I Learned</h4>
                <p className="font-body text-muted leading-relaxed">{project.learned}</p>
              </div>

              {/* Links */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-white/5">
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-body text-sm font-medium rounded-full transition-all duration-300"
                >
                  Live Demo
                  <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
                {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 px-6 py-3 border border-white/10 hover:border-accent/50 text-white font-body text-sm font-medium rounded-full transition-all duration-300 hover:bg-accent/5"
                >
                  GitHub
                  <Github size={14} />
                </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
