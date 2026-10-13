import { motion } from 'framer-motion';
import { skillCategories } from '@/data/skills';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7 },
};

export default function Skills() {
  return (
    <section id="skills" className="relative py-32 lg:py-40 bg-dark">
      {/* Background text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
        <span className="font-display font-bold text-[10vw] text-white/[0.015] tracking-tighter-custom uppercase">
          SKILLS
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div {...fadeInUp} className="mb-20">
          <p className="font-body text-accent text-sm uppercase tracking-[0.3em] mb-4">Skills</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter-custom">
            What I work with
            <span className="text-accent">.</span>
          </h2>
          <p className="font-body text-muted text-base lg:text-lg mt-6 max-w-2xl">
            Technologies I'm currently learning, practicing, and using in real projects. No fake percentages — just honest progress.
          </p>
        </motion.div>

        {/* Skills grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {skillCategories.map((category, catIdx) => (
            <motion.div
              key={category.title}
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: catIdx * 0.1 }}
              className={`group p-8 bg-dark-50 border border-white/5 rounded-2xl hover:border-accent/20 transition-all duration-500 ${
                category.title === 'Currently Exploring'
                  ? 'sm:col-span-2 lg:col-span-1 border-dashed border-accent/10'
                  : ''
              }`}
            >
              <div className="mb-6">
                <h3 className="font-display text-xl font-bold text-white tracking-tight-custom">
                  {category.title}
                </h3>
                <p className="font-body text-sm text-muted mt-2">{category.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <span
                    key={skill.name}
                    className={`px-3 py-1.5 text-xs font-body font-medium rounded-full transition-colors duration-300 ${
                      skill.exploring
                        ? 'bg-accent/5 text-accent/70 border border-accent/10 border-dashed'
                        : 'bg-white/5 text-white/70 hover:bg-accent/10 hover:text-accent'
                    }`}
                  >
                    {skill.name}
                    {skill.exploring && (
                      <span className="ml-1 text-[10px] text-accent/40">↗</span>
                    )}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
