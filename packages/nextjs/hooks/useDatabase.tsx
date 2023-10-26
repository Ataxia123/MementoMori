import { useEffect, useState } from "react";
import { useAuthentication } from "../hooks/useAuthentication";
import { Character } from "../types/index";
import toast from "react-hot-toast";
import { useAccount } from "wagmi";

export const useDatabase = () => {
  const [database, setDatabase] = useState<Character[]>([]);
  const [players, setPlayers] = useState<any[]>();
  const { user } = useAuthentication();
  const [dead, setDead] = useState<Character[]>([]);
  const [alive, setAlive] = useState<Character[]>([]);
  const [player, setPlayer] = useState<Character | undefined>();
  const [deadIndex, setDeadIndex] = useState<number>(0);
  const account = useAccount();
  const address = account?.address;

  const inventory = {
    HEAD: 1,
    NECK: 2,
    SHOULDER: 3,
    SHIRT: 4,
    CHEST: 5,
    WAIST: 6,
    LEGS: 7,
    FEET: 8,
    WRIST: 9,
    HANDS: 10,
    BACK: 15,
    MAIN_HAND: 16,
    OFF_HAND: 17,
    RANGED: 18,
    TABBARD: 19,
  };

  const fetchDb = async () => {
    const response = await fetch("http://localhost:3000/api/database"); // assume the same host
    const data = await response.json();
    console.log(data, "Player data from DB");
    setDatabase(data.players);
  };

  const postDb = async (players: Character) => {
    try {
      const response = await fetch("http://localhost:3000/api/db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(players),
      });

      const data = await response.json();
      toast.success("success posting dead players to db");
      console.log(data, "POST Player data response");
    } catch (e) {
      toast.error("error posting dead players to db");
      console.log(e);
    }
  };

  const fetchCharData = async (url: string) => {
    try {
      const response = await fetch(`${url}&access_token=${user.token}`);
      const data = await response.json();

      const index0 = alive?.findIndex(x => x.id === data.id);
      const index1 = dead?.findIndex(x => x.id === data.id);
      const index2 = database.findIndex(x => x.id === data._id);

      const profile: Character = {
        id: data.id,
        name: data.name,
        level: data.level,
        owner: address ? address : "no data",
        faction: data.faction.type,
        race: data.race.name.en_US,
        class: data.character_class.name.en_US,
        gender: data.gender.type,
        is_ghost: data.is_ghost,
        media: data.equipment.href,
        equipped_items: [{}],
      };
      console.log(data, index1, index2, "data");
      if (data.is_ghost == true && index1 == -1) {
        // maybe update database here
        setDead(prevState => [...prevState, profile]);

        return console.log(data.name, "dead", data.level);
      } else {
        if (index0 != -1 || data.level < 10) return console.log(data.name, "already in db", data.level);
        console.log(profile, "profile");
        setAlive(prevState => [...prevState, profile]);

        return console.log(data.name, "not dead", data.level);
      }
    } catch (e) {
      return console.log(e);
    }
  };

  const fetchCharacter = async () => {
    if (!user || !user.token) {
      console.log("User is not logged in");
      return;
    }

    try {
      const response = await fetch(
        `https://us.api.blizzard.com/profile/user/wow?namespace=profile-classic1x-us&access_token=${user.token}`,
      );
      const data = await response.json();
      const wowAccount = data.wow_accounts[0].characters;
      setPlayers(wowAccount);
    } catch (e) {
      toast.error("error getting characters");
      console.log(e);
    }
  };

  const fetchCharMedia = async () => {
    if (user?.token == null) return console.log("no token");

    try {
      players?.map((character: any) => {
        if (character.level < 10)
          return console.log(character.character.name, "too low level", character.character.level);
        fetchCharData(character.character.href);
      });

      //todo: change to dead players

      const url = dead[deadIndex]?.media;

      console.log(url, "url", dead[deadIndex]?.name, "name", deadIndex, "deadIndex");

      const response = await fetch(`${url}&access_token=${user.token}`);
      const data = await response.json();
      const index = dead?.findIndex(x => x.id === data.character.id);

      console.log(response, "data");

      setDead(prevState => {
        const newState = [...prevState];
        newState[index].equipped_items = data.equipped_items;
        setPlayer(newState[index]);
        player ? postDb(player) : console.log("fuck off");
        return newState;
      });
      console.log(data, dead[index].name, "equipment data", alive, index);
      toast.success(`"success getting characters"${dead[deadIndex].name}`);
    } catch (e) {
      toast.error("error getting equipment");
      console.log(e);
    }
  };

  useEffect(() => {
    fetchDb();
  }, []);

  return {
    database,
    setDatabase,
    fetchDb,
    postDb,
    fetchCharacter,
    player,
    fetchCharMedia,
    setPlayer,
    dead,
    deadIndex,
    setDeadIndex,
  };
};
