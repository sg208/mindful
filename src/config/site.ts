export const siteConfig = {
  name: 'Mindful',
  tagline: 'Short, gentle reads for everyday mental wellbeing.',
  description:
    'Mindful shares brief, research-informed essays on anxiety, mindfulness, relationships, self-care, and rest. Not a substitute for professional care.',
  locale: 'en',
  author: 'The Mindful Editors',
  themeColor: '#F3F2EE',
  themeColorDark: '#121513',
  /** Where every "Need help now?" link points: the crisis section of the disclaimer. */
  supportHref: '/disclaimer#in-crisis',
  headerNav: [
    { href: '/posts', label: 'All essays' },
    { href: '/#themes', label: 'Themes' },
    { href: '/about', label: 'About' },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
