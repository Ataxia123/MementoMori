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
  media?: string;
};

export interface EquipmentItem {
  id: string;
  name: string;
  // Add other necessary fields here
}

export interface Player {
  id: string;
  name: string;
  equipped_items: EquipmentItem[];
  // Add other necessary fields here
}
