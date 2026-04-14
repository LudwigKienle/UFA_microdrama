export interface Episode {
  id: string;
  showId: string;
  episodeNumber: number;
  title: string;
  description?: string;
  duration?: string;
  thumbnail: string;
  videoUrl: string;
  coinCost: number;
}

export interface Show {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  views: string;
  tags: string[];
  badge?: string;
  comingSoon?: boolean;
  episodes: Episode[];
}

export interface User {
  coins: number;
  unlockedEpisodes: string[];
  isVip?: boolean;
  avatarUrl?: string;
}
