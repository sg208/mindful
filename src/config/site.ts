export const siteConfig = {
  name: 'Mindful',
  tagline: 'Short, gentle reads for everyday mental wellbeing.',
  description:
    'Mindful shares brief, research-informed essays on anxiety, mindfulness, relationships, self-care, and rest. Not a substitute for professional care.',
  locale: 'en',
  author: 'The Mindful Editors',
  themeColor: '#6B8E7F',
  nav: [
    { href: '/', label: 'Home' },
    { href: '/categories/mindfulness', label: 'Mindfulness' },
    { href: '/categories/anxiety-stress', label: 'Anxiety' },
    { href: '/categories/self-care', label: 'Self-Care' },
    { href: '/categories/sleep-rest', label: 'Rest' },
    { href: '/about', label: 'About' },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
