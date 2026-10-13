import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7 },
};

const roadmapItems = [
  { label: 'Frontend', status: 'active' as const, desc: 'HTML, CSS, JavaScript' },
  { label: 'React', status: 'active' as const, desc: 'Components, hooks, state' },
  { label: 'TypeScript', status: 'active' as const, desc: 'Type safety, interfaces' },
  { label: 'APIs', status: 'learning' as const, desc: 'REST, integration, data' },
  { label: 'Backend', status: 'next' as const, desc: 'Node.js, Express, logic' },
  { label: 'Databases', status: 'next' as const, desc: 'SQL, NoSQL, data models' },
  { label: 'SaaS', status: 'next' as const, desc: 'Building SaaS products' },
  { label: 'Automation', status: 'next' as const, desc: 'n8n, workflows, APIs' },
];

export default function Learning() {
  return (
    <section className="relative py-32 lg:py-40 bg-dark">
      {/* Subtle background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/[0.02] rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div {...fadeInUp} className="text-center mb-20">
          <p className="font-body text-accent text-sm uppercase tracking-[0.3em] mb-4">Growth</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter-custom">
            Always building
            <span className="text-accent">.</span>
            <br />
            Always learning
            <span className="text-accent">.</span>
          </h2>
          <p className="font-body text-muted text-base lg:text-lg mt-6 max-w-xl mx-auto">
            My roadmap of technologies I'm exploring and where I'm heading next.
          </p>
        </motion.div>

        {/* Roadmap */}
        <div className="relative max-w-3xl mx-auto">
          {/* Center line */}
          <div className="absolute left-6 lg:left-1/2 lg:-translate-x-px top-0 bottom-0 w-[2px] bg-gradient-to-b from-accent/40 via-accent/20 to-white/5" />

          <div className="space-y-8 lg:space-y-12">
            {roadmapItems.map((item, i) => (
              <motion.div
                key={item.label}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: i * 0.08 }}
                className={`relative flex items-start gap-6 lg:gap-0 ${
                  i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Dot */}
                <div className="absolute left-6 lg:left-1/2 -translate-x-1/2 z-10">
                  <div
                    className={`w-3 h-3 rounded-full border-2 ${
                      item.status === 'active'
                        ? 'bg-accent border-accent shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                        : item.status === 'learning'
                        ? 'bg-accent/30 border-accent/50'
                        : 'bg-dark-200 border-white/10'
                    }`}
                  />
                </div>

                {/* Content */}
                <div
                  className={`ml-14 lg:ml-0 lg:w-[calc(50%-2rem)] ${
                    i % 2 === 0 ? 'lg:pr-8 lg:text-right' : 'lg:pl-8 lg:text-left'
                  }`}
                >
                  <div className="flex items-center gap-3 lg:justify-end" style={i % 2 !== 0 ? { justifyContent: 'flex-start' } : undefined}>
                    <h3 className="font-display text-lg font-bold text-white">{item.label}</h3>
                    <span
                      className={`text-[10px] font-body font-medium uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        item.status === 'active'
                          ? 'bg-accent/10 text-accent'
                          : item.status === 'learning'
                          ? 'bg-accent/5 text-accent/60'
                          : 'bg-white/5 text-white/30'
                      }`}
                    >
                      {item.status === 'active' ? 'Active' : item.status === 'learning' ? 'Learning' : 'Next'}
                    </span>
                  </div>
                  <p className="font-body text-sm text-muted mt-1">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
