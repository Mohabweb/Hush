export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  overview: string;
  goal: string;
  features: string[];
  techStack: string[];
  challenges: string;
  learned: string;
  liveUrl: string;
  githubUrl?: string;
  accent?: string;
}

export const projects: Project[] = [
  {
    id: 'reds-gym',
    title: 'Reds Gym',
    subtitle: 'Website Concept',
    description: 'A modern website concept for a local gym — focused on bold visual identity, responsive design, and professional online presence.',
    overview: 'Reds Gym is a website concept designed to give a local gym a strong, modern digital presence. The project focuses on visual impact with a dark/red aesthetic that reflects the energy and intensity of a gym environment.',
    goal: 'Create a professional, visually striking gym website that presents services, contact info, and brand identity in a modern way.',
    features: [
      'Modern dark/red visual identity',
      'Responsive across all devices',
      'Gym information and services section',
      'Contact information and social media links',
      'Smooth animations and transitions',
      'Strong visual hierarchy',
    ],
    techStack: ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'React'],
    challenges: 'Balancing a bold, high-contrast visual style with readability and usability across different screen sizes.',
    learned: 'Strengthened my understanding of responsive design patterns, color theory in dark UIs, and component-based architecture with React.',
    liveUrl: 'https://reds-gym-website-sand.vercel.app/',
    githubUrl: 'https://github.com/Mohabweb/Reds-Gym-Website',
    accent: '#ef4444',
  },
  {
    id: 'expense-tracker',
    title: 'Expense Tracker',
    subtitle: 'Web Application',
    description: 'A clean personal finance tracker for managing daily expenses with categorization and visual insights.',
    overview: 'Expense Tracker is a web application designed to help users manage their personal finances. It provides a clean interface for tracking daily expenses with categorization and simple visual feedback.',
    goal: 'Build a functional expense management tool with a modern, intuitive interface.',
    features: [
      'Add, edit, and delete expenses',
      'Expense categorization',
      'Responsive interface',
      'Clean and intuitive UI',
      'Real-time expense summary',
    ],
    techStack: ['HTML', 'CSS', 'JavaScript'],
    challenges: 'Managing state for dynamic expense entries while keeping the codebase clean and maintainable.',
    learned: 'Gained practical experience with DOM manipulation, event handling, and building interactive UIs with vanilla JavaScript.',
    liveUrl: 'https://expense-tracker101.vercel.app/',
    githubUrl: 'https://github.com/Mohabweb/Expense-Tracker101',
    accent: '#10b981',
  },
  {
    id: 'fort-fitness',
    title: 'Fort Fitness',
    subtitle: 'Gym Website · Doha, Qatar',
    description: 'A dark, electric-blue marketing site for a two-branch gym in Doha — membership plans, branch directions, and one-tap calling.',
    overview: 'Fort Fitness is a single-page website for a gym with two branches in Doha, Qatar (D Ring Road and C Ring Road, Al Sadd). It presents the space, the membership plans in QAR, and makes it easy to call or get directions to either branch.',
    goal: 'Turn a local gym\'s online presence into a clear, fast page that moves visitors from "what is this place?" to calling a branch.',
    features: [
      'Four membership plans with a highlighted best-value yearly plan',
      'Two branches with click-to-call and Google Maps directions',
      'English / Arabic language switch with RTL support',
      'Pixelated GSAP section transitions',
      'Dark navy-to-blue glass-card visual identity',
      'Fully responsive layout',
    ],
    techStack: ['Vite', 'HTML', 'CSS', 'JavaScript', 'GSAP'],
    challenges: 'Supporting a full Arabic right-to-left layout alongside English while keeping the animated transitions smooth.',
    learned: 'Practiced bilingual site structure, scroll-driven animation with GSAP, and keeping all content in one data object so plans are easy to update.',
    liveUrl: 'https://fort-fitness-iota.vercel.app/#home',
    accent: '#2e5de6',
  },
  {
    id: 'loganitus-training',
    title: 'Loganitus Training',
    subtitle: 'Fitness Website · Humble, TX',
    description: 'A high-energy website for a fitness business offering group fitness, personal training, and youth performance programs.',
    overview: 'Loganitus Training is a website for a fitness business in Humble, Texas. It presents group fitness, personal training, youth performance programs, and the FitFam Nation community, with a free first class as the main call to action.',
    goal: 'Give a local training business a welcoming, energetic site that explains what they offer and gets new people through the door.',
    features: [
      'Group fitness, personal training and youth programs',
      'FitFam Nation community section',
      'Free first class call to action',
      'Dark green-black visual identity',
      'Responsive across all devices',
    ],
    techStack: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript'],
    challenges: 'Presenting several different programs for different audiences without making the page feel crowded.',
    learned: 'Improved how I structure offerings and calls to action so a visitor always knows the next step.',
    liveUrl: 'https://loganitus-training.vercel.app/',
    accent: '#34d399',
  },
  {
    id: 'batch-no9',
    title: 'Batch NO.9',
    subtitle: 'Café Website · Alexandria',
    description: 'A warm, inviting website for a Stanley, Alexandria coffee shop, deli and dessert spot open from morning to midnight.',
    overview: 'Batch NO.9 is a website for a coffee shop, deli and dessert spot in Stanley, Alexandria. It highlights specialty coffee, fresh deli food and desserts, along with opening hours (7:00 AM to 12:00 AM).',
    goal: 'Build a café site that feels as warm as the place itself and makes the offering and hours obvious at a glance.',
    features: [
      'Coffee, deli and dessert showcase',
      'Opening hours front and center',
      'Social sharing preview image',
      'Warm coffee-toned visual identity',
      'Responsive across all devices',
    ],
    techStack: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript'],
    challenges: 'Capturing a cozy café atmosphere on screen while keeping the page fast and easy to read on a phone.',
    learned: 'Strengthened my sense of color and imagery for food brands, and how to prepare optimized images and social metadata.',
    liveUrl: 'https://batch-no9-cafe-website.vercel.app/',
    accent: '#d9954a',
  },
  {
    id: 'gymtech',
    title: 'GymTech',
    subtitle: 'Gym Website · Riyadh & Jeddah',
    description: 'A bilingual Arabic / English gym website with a branch finder, membership plans, and app download links.',
    overview: 'GymTech is a bilingual website for a gym brand with branches in Riyadh and Jeddah. It covers features for men and ladies, a branch finder with map links, membership plans, mobile app downloads, and quick contact options.',
    goal: 'Create a polished, bilingual site that helps visitors pick a plan, find their nearest branch and get in touch.',
    features: [
      'Arabic / English language toggle',
      'Men / Ladies feature tabs',
      'Branch finder with map links',
      'Membership plans with durations',
      'iOS and Android app download links',
      'WhatsApp, phone and email contact options',
    ],
    techStack: ['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript'],
    challenges: 'Keeping one consistent layout across Arabic (RTL) and English while handling tabs, plans and branches in both languages.',
    learned: 'Got hands-on with multilingual routing, tabbed interfaces, and structuring plan and branch data cleanly.',
    liveUrl: 'https://gym-tech-gules.vercel.app/en',
    accent: '#f97316',
  },
];
