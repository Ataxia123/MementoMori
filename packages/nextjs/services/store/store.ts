import create from "zustand";
import { Character, Item, Respect } from "~~/types/appTypes";

/**
 * Zustand Store
 *
 * You can add global state to the app using this useGlobalState, to get & set
 * values from anywhere in the app.
 *
 * Think about it as a global useState.
 */

type TGlobalState = {
  nativeCurrencyPrice: number;
  setNativeCurrencyPrice: (newNativeCurrencyPriceState: number) => void;
  database: { players: Character[]; respects: Respect[]; items: Item[] };
  setDatabase: (newDatabase: any) => void;
  user: { bnet: string; address: string; battleTag: string };
  setUser: (newUser: any) => void;
  deadPlayers: Character[];
  setDeadPlayers: (newDeadPlayers: Character[]) => void;
  player: Character;
  setPlayer: (newPlayer: Character) => void;
};

export const useGlobalState = create<TGlobalState>(set => ({
  nativeCurrencyPrice: 0,
  setNativeCurrencyPrice: (newValue: number): void => set(() => ({ nativeCurrencyPrice: newValue })),
  database: { players: [], respects: [], items: [] },
  setDatabase: (newDatabase: any): void => set(() => ({ database: newDatabase })),
  user: { bnet: "", address: "", battleTag: "" },
  setUser: (newUser: any): void => set(() => ({ user: newUser })),
  deadPlayers: [],
  setDeadPlayers: (newDeadPlayers: Character[]): void => set(() => ({ deadPlayers: newDeadPlayers })),
  player: {} as Character,
  setPlayer: (newPlayer: Character): void => set(() => ({ player: newPlayer })),
}));
