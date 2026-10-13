import { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import { projects, type Project } from '@/data/projects';
import ProjectModal from './ProjectModal';
import ProjectPreview from './ProjectPreview';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7 },
};

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <>
      <section id="projects" className="relative py-32 lg:py-40 bg-dark">
        {/* Background text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
          <span className="font-display font-bold text-[10vw] text-white/[0.015] tracking-tighter-custom uppercase">
            PROJECTS
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Section header */}
          <motion.div {...fadeInUp} className="mb-20">
            <p className="font-body text-accent text-sm uppercase tracking-[0.3em] mb-4">Projects</p>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter-custom">
              Things I've built
              <span className="text-accent">.</span>
            </h2>
            <p className="font-body text-muted text-base lg:text-lg mt-6 max-w-2xl">
              Real projects, real code. Each one taught me something new.
            </p>
          </motion.div>

          {/* Project cards */}
          <div className="space-y-20 lg:space-y-32">
            {projects.map((project, i) => (
              <motion.article
                key={project.id}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: i * 0.15 }}
                className={`grid lg:grid-cols-2 gap-8 lg:gap-16 items-center ${
                  i % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
                }`}
              >
                {/* Image */}
                <button
                  type="button"
                  className={`group relative cursor-pointer ${i % 2 === 1 ? 'lg:col-start-2' : ''}`}
                  onClick={() => setSelectedProject(project)}
                  aria-label={`View details for ${project.title}`}
                >
                  <div className="relative aspect-[16/10] bg-dark-100 rounded-2xl overflow-hidden border border-white/5 group-hover:border-accent/20 transition-all duration-500">
                    <ProjectPreview project={project} />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/5 transition-colors duration-500" />
                    {/* Gradient edge */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-dark-100 to-transparent" />
                  </div>

                  {/* Corner accent */}
                  <div
                    className="absolute -bottom-2 -right-2 w-20 h-20 border-r-2 border-b-2 rounded-br-2xl transition-colors duration-500 group-hover:border-accent/30"
                    style={{ borderColor: project.accent ? `${project.accent}20` : 'rgba(59,130,246,0.1)' }}
                  />
                </button>

                {/* Content */}
                <div className={i % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}>
                  <p className="font-body text-xs uppercase tracking-[0.3em] mb-3" style={{ color: project.accent || '#3b82f6' }}>
                    {project.subtitle}
                  </p>
                  <h3 className="font-display text-3xl lg:text-4xl font-bold text-white tracking-tighter-custom mb-4">
                    {project.title}
                  </h3>
                  <p className="font-body text-muted leading-relaxed mb-6">
                    {project.description}
                  </p>

                  {/* Tech tags */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 text-xs font-body font-medium bg-white/5 text-white/60 rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-wrap gap-4">
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/btn flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-body text-sm font-medium rounded-full transition-all duration-300"
                    >
                      Live Demo
                      <ExternalLink size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </a>
                    {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/btn flex items-center gap-2 px-6 py-3 border border-white/10 hover:border-accent/50 text-white font-body text-sm font-medium rounded-full transition-all duration-300 hover:bg-accent/5"
                    >
                      GitHub
                      <Github size={14} />
                    </a>
                    )}
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="px-6 py-3 text-muted hover:text-accent font-body text-sm font-medium transition-colors duration-300"
                    >
                      Details →
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Project Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
}
