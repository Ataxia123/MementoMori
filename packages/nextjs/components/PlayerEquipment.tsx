import React, { Dispatch, SetStateAction } from "react";
// Assuming you've created a 'types.ts' file for your types
import { useDatabase } from "../hooks/useDatabase";
import { Character } from "../types/index";

interface Props {
  player: Character | undefined;
  postDb: (players: Character) => Promise<void>;
  fetchCharMedia: () => Promise<void>;
  deadIndex: number;
  setDeadIndex: Dispatch<SetStateAction<number>>;
}

const PlayerEquipment: React.FC<Props> = ({ player }) => {
  return (
    <div>
      Player Equipment:
      {/* Implement your player's equipment display logic here */}
    </div>
  );
};

export default PlayerEquipment;
