import { useEffect, useState } from "react";
import React from "react";
import type { NextPage } from "next";
import toast from "react-hot-toast";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { useAccount } from "wagmi";

type Character = {
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

const Home: NextPage = () => {
  const RACES = [`Human`, `Orc`, `Dwarf`, `Night Elf`, `Undead`, `Tauren`, `Gnome`, `Troll`];

  const [user, setUser] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>();
  const [dead, setDead] = useState<Character[]>([]);
  const [alive, setAlive] = useState<Character[]>([]);
  const [database, setDatabase] = useState<any[]>([]);
  const [player, setPlayer] = useState<Character | undefined>();
  const [deadIndex, setDeadIndex] = useState<number>(0);

  // Renderer
  //
  //
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
  const account = useAccount();

  const address = account?.address;
  // LOGIN METHODS
  let popup: Window | null = null;
  const login = () => {
    popup = window.open(
      "http://localhost:3000/oauth/battlenet",
      "targetWindow",
      `toolbar=no,
       location=no,
       status=no,
       menubar=no,
       scrollbars=yes,
       resizable=yes,
       width=620,
       height=700`,
    );
    // Once the popup is closed
    window.addEventListener(
      "message",
      event => {
        if (event.origin !== "http://localhost:3000") return;
        console.log("event", event);

        if (event.data) {
          setUser(event.data);
          toast.success("success");
          popup?.close();
        }
      },
      false,
    );
  };

  const logout = async () => {
    try {
      const response = await fetch("http://localhost:3000/oauth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setUser(null);
        toast.success("Logging out successful");
      } else {
        console.error("Failed to logout", response);
        toast.error("Failed to logout");
      }
    } catch (e) {
      console.log(e);
    }
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

  const fetchCharacter = async () => {
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

  const playerSelector = async (selectedPlayer: Character) => {
    if (!selectedPlayer) return console.log("no player selected");

    setPlayer(selectedPlayer);
    await fetchCharMedia();
    if (deadIndex >= dead.length) {
      setDeadIndex(0);

      toast.success(`"success getting all players ${dead.length} ${deadIndex + 1}"`);
    } else {
      setDeadIndex(deadIndex + 1);
    }
  };
  useEffect(() => {
    fetchDb();
  }, []);

  useEffect(() => {
    if (user === null) return;
    fetchCharacter();
    toast.success("success");
  }, [user]);

  useEffect(() => {
    console.log(players, "players");

    players?.map((character: any) => {
      if (character.level < 10)
        return console.log(character.character.name, "too low level", character.character.level);
      fetchCharData(character.character.href);
    });

    console.log("dead", dead, "alive", alive);
    toast.success("success getting characters");
  }, [players]);
  //this code is so ugly i need to make this console log to remind myself of how ugly it is

  console.log("FIX ME PLEASE💀💀💀💀");

  const InventoryUrl = () => {
    let url = "";
    player?.equipped_items?.map(async (item: any) => {
      const slot = item.slot.type;
      const inventorySlot = inventory[`${slot}` as keyof typeof inventory];
      const equipped_item = {
        slot: slot,
        slot_ID: inventorySlot,
        item_id: item.item.id,
        item_name: item.name.en_US,
      };

      url = url + `&${slot}=${equipped_item.item_id}`;
    });
    return url;
  };
  const render = () => {
    const index3 = player?.race ? RACES.indexOf(player?.race) + 1 : "1";
    const url = InventoryUrl();
    console.log(url);
    toast.success(`success rendering ${index3}`);
    console.log(index3, "index3");
    popup = window.open(
      `http://localhost:3000/api/render?characterId=${player?.id}&name=${player?.name}&faction=${player?.faction}&class=${player?.class}&gender=1&race=${index3}&facial_hair=1&hairStyle=1&hairColor=1&facialStyle=1` +
        url,
      "targetWindow",
      `toolbar=no,
       location=no,
       status=no,
       menubar=no,
       scrollbars=yes,
       resizable=yes,
       width=620,
       height=700`,
    ); //listen for response
  };

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  // Once the popup is closed
  return (
    <>
      <div className="flex flex-col items-center justify-center bg-black text-white">
        <div className="card mb-4">
          {!user ? (
            <button
              onClick={() => {
                login();
              }}
            >
              LOGIN WITH BNET
            </button>
          ) : (
            <div>Logged in as {user.battletag}</div>
          )}
          <div>Bnet User: {user?.token || "no data"}</div>
          <div>Address: {address || "no data"}</div>
          <div>User: {user ? user.battletag : "no data"}</div>
          <button
            onClick={() => {
              logout();
              toast.success("Successfully logged out");
            }}
          >
            Logout
          </button>
        </div>

        <div className="flex justify-center items-center">
          <div className="border-2 border-white text-center w-full max-w-2xl mx-auto overflow-hidden">
            {players && players.length > 0 ? (
              <Slider {...settings}>
                {players.map((player, index) => (
                  <div key={index} className="p-4">
                    <div className="card">
                      <div>Name: {player.name}</div>
                      <div>Level: {player.level}</div>
                      <div>Race: {player.race}</div>
                      <div>Class: {player.class}</div>
                    </div>
                  </div>
                ))}
              </Slider>
            ) : (
              <div>No players</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
