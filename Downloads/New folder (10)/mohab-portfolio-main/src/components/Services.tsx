import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { services } from '@/data/services';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7 },
};

export default function Services() {
  return (
    <section id="services" className="relative py-32 lg:py-40 bg-dark">
      {/* Background text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
        <span className="font-display font-bold text-[10vw] text-white/[0.015] tracking-tighter-custom uppercase">
          SERVICES
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div {...fadeInUp} className="mb-20">
          <p className="font-body text-accent text-sm uppercase tracking-[0.3em] mb-4">Services</p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter-custom">
            What I can build for you
            <span className="text-accent">.</span>
          </h2>
          <p className="font-body text-muted text-base lg:text-lg mt-6 max-w-2xl">
            Whether you're a local business that needs a website or a startup looking for a landing page — I can help you get online with a modern, responsive site.
          </p>
        </motion.div>

        {/* Services list */}
        <div className="space-y-1">
          {services.map((service, i) => (
            <motion.div
              key={service.number}
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: i * 0.1 }}
              className="group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 py-8 lg:py-10 border-b border-white/5 group-hover:border-accent/20 transition-colors duration-500 cursor-default">
                {/* Number */}
                <span className="font-display text-sm font-bold text-accent/40 group-hover:text-accent transition-colors duration-500 shrink-0">
                  {service.number}
                </span>

                {/* Title */}
                <h3 className="font-display text-2xl lg:text-3xl font-bold text-white tracking-tight-custom group-hover:text-accent transition-colors duration-500 sm:w-72 shrink-0">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="font-body text-muted text-sm lg:text-base leading-relaxed flex-1">
                  {service.description}
                </p>

                {/* Arrow */}
                <div className="hidden lg:block">
                  <ArrowUpRight
                    size={20}
                    className="text-white/10 group-hover:text-accent group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-500"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Why work with me */}
        <motion.div
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.3 }}
          className="mt-24 lg:mt-32"
        >
          <h3 className="font-display text-2xl lg:text-3xl font-bold text-white tracking-tighter-custom mb-12">
            Why work with me
            <span className="text-accent">?</span>
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Modern Design', desc: 'Clean, contemporary websites that look professional and stand out.' },
              { title: 'Responsive', desc: 'Every website works perfectly on phones, tablets, and desktops.' },
              { title: 'Fast Iteration', desc: 'An efficient workflow means quick turnarounds and fast adjustments.' },
              { title: 'Direct Communication', desc: 'No middlemen. You talk to the person building your website.' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: 0.4 + i * 0.1 }}
                className="p-6 bg-dark-50 border border-white/5 rounded-2xl hover:border-accent/20 transition-all duration-500"
              >
                <h4 className="font-display text-base font-bold text-white mb-2">{item.title}</h4>
                <p className="font-body text-sm text-muted leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
