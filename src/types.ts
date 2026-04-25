export interface User {
  id: number;
  email: string;
  name: string;
}

export interface MusicItem {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  type: 'song' | 'artist' | 'album' | 'chart';
  preview_url?: string;
  deezer_url?: string;
  rank?: number;
}

export interface SavedItem extends MusicItem {
  db_id: number;
  user_id: number;
  item_id: string;
}
