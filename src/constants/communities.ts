export const COMMUNITIES = [
  { id: 'reddit', name: 'Reddit', ftcVariance: 0.02, description: 'High traffic, moderate risk' },
  { id: 'discord', name: 'Discord', ftcVariance: -0.02, description: 'Tight-knit, slightly safer' },
  { id: 'dark_web', name: 'The Dark Web', ftcVariance: 0.08, description: 'High regulator presence' },
  { id: 'twitter', name: 'X', ftcVariance: 0.04, description: 'Volatile, elevated risk' },
  { id: 'podcast', name: 'Podcast Promos', ftcVariance: -0.04, description: 'Low enforcement zone' },
  { id: 'github', name: 'Meetups', ftcVariance: -0.05, description: 'In-person community, safest' },
] as const;

export type CommunityId = typeof COMMUNITIES[number]['id'];

export const COMMUNITY_MAP = Object.fromEntries(
  COMMUNITIES.map(c => [c.id, c])
) as Record<CommunityId, typeof COMMUNITIES[number]>;
