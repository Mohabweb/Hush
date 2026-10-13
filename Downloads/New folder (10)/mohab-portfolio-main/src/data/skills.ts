export interface SkillCategory {
  title: string;
  description: string;
  skills: SkillItem[];
}

export interface SkillItem {
  name: string;
  exploring?: boolean;
}

export const skillCategories: SkillCategory[] = [
  {
    title: 'Core Web',
    description: 'The fundamentals I build with every day.',
    skills: [
      { name: 'HTML' },
      { name: 'CSS' },
      { name: 'JavaScript' },
    ],
  },
  {
    title: 'Modern Frontend',
    description: 'Component-based, typed UI development.',
    skills: [
      { name: 'React' },
      { name: 'TypeScript' },
    ],
  },
  {
    title: 'Programming',
    description: 'Languages and paradigms I work with.',
    skills: [
      { name: 'Java' },
      { name: 'OOP' },
    ],
  },
  {
    title: 'Development',
    description: 'Tools and practices in my current workflow.',
    skills: [
      { name: 'Responsive Design' },
      { name: 'DOM Manipulation' },
      { name: 'Git & GitHub' },
      { name: 'API Integration' },
    ],
  },
  {
    title: 'Currently Exploring',
    description: 'Technologies I\'m actively learning and experimenting with.',
    skills: [
      { name: 'Node.js', exploring: true },
      { name: 'APIs', exploring: true },
      { name: 'Databases', exploring: true },
      { name: 'SaaS', exploring: true },
      { name: 'n8n', exploring: true },
    ],
  },
];
