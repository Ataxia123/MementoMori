export type Character = {
  id: number;
  name: string;
  level: number;
  owner: string;
  gender: string;
  class: string;
  race: string;
  faction: string;
  is_ghost: boolean;
  equipped_items: [unknown];
  Attestation?: string | undefined;
  media?: string;
};

export type Sounds = {
  spaceshipOn?: AudioBuffer | null;
};

export type Respect = {
  hero: number;
  prayer: string;
  signer: string;
  Attestation: string;
};

export type Item = {
  id: number;
  name: string;
  owner: string;
};

export type Database = {
  players: Character[];
  respects: Respect[];
  items: Item[];
  respectsTally: { hero: number; tally: Respect[] };
};

export interface Filter {
  class?: string;
  race?: string;
  level?: number;
  name?: string;
}
