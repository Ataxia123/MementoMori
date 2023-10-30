import { useEffect, useState } from "react";
import React from "react";
import Image from "next/image";
import { randomInt } from "crypto";
import type { NextPage } from "next";
import toast from "react-hot-toast";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { useAccount } from "wagmi";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";

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
  const [mmToggle, setMmToggle] = useState<boolean>(false);
  const [infoToggle, setInfoToggle] = useState<boolean>(false);
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

  const fetchCharMedia = async (index: number) => {
    if (user?.token == null) return console.log("no token");

    try {
      players?.map((character: any) => {
        if (character.level < 10)
          return console.log(character.character.name, "too low level", character.character.level);
        fetchCharData(character.character.href);
      });

      //todo: change to dead players

      const url = dead[index]?.media;

      console.log(url, "url", dead[index]?.name, "name", index, "deadIndex");

      const response = await fetch(`${url}&access_token=${user.token}`);
      const data = await response.json();
      const dindex = dead?.findIndex(x => x.id === data.character.id);

      console.log(response, "data");

      setDead(prevState => {
        const newState = [...prevState];
        newState[dindex].equipped_items = data.equipped_items;
        setPlayer(newState[index]);
        player ? postDb(player) : console.log("fuck off");
        return newState;
      });
      console.log(data, dead[dindex].name, "equipment data", alive, index);
    } catch (e) {
      toast.error("error getting equipment");
      console.log(e);
    }
  };

  const playerSelector = async (index: number) => {
    if (!players) return console.log("no players");
    setDeadIndex(index);
    await fetchCharMedia(index);
  };
  useEffect(() => {
    fetchDb();
  }, []);

  useEffect(() => {
    if (user === null) return;
    fetchCharacter();
  }, [user]);

  useEffect(() => {
    console.log(players, "players");

    players?.map((character: any) => {
      if (character.level < 10)
        return console.log(character.character.name, "too low level", character.character.level);
      fetchCharData(character.character.href);
    });

    console.log("dead", dead, "alive", alive);
  }, [players]);

  const InventoryUrl = () => {
    let url = "";
    player?.equipped_items?.map(async (item: any) => {
      if (item && item.slot && typeof item.slot.type === "string") {
        const slot = item.slot.type;
        const inventorySlot = inventory[`${slot}` as keyof typeof inventory];
        const equipped_item = {
          slot: slot,
          slot_ID: inventorySlot,
          item_id: item.item.id,
          item_name: item.name.en_US,
        };

        url = url + `&${slot}=${equipped_item.item_id}`;
      } else {
        console.error("Invalid item or slot type", item);
      }
    });
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
    onClick: () => {
      render();
    },
  };
  // Once the popup is closed
  //
  const playerColor = (character: Character) => {
    if (character.class == "Druid") {
      return "text-orange-500";
    } else if (character.class == "Priest") {
      return "text-gray-500";
    } else if (character.class == "Warlock") {
      return "text-purple-500";
    } else if (character.class == "Warrior") {
      return "text-brown-500";
    } else if (character.class == "Paladin") {
      return "text-pink-500";
    } else if (character.class == "Rogue") {
      return "text-yellow-500";
    } else if (character.class == "Mage") {
      return "text-blue-50";
    } else if (character.class == "Shaman") {
      return "text-blue-500";
    } else {
      return "text-green-500";
    }
  };

  const factionColor = (character: Character) => {
    if (character.faction == "ALLIANCE") {
      return "text-blue-500";
    } else {
      return "text-red-500";
    }
  };
  function MyComponent(props: any) {
    const { index } = props;
    useEffect(() => {
      const handleKeyPress = (event: any) => {
        if (event.key === "F" || event.key === "f") {
          // Call your function here
          playerSelector(index);
        }
      };

      const myFunction = () => {
        console.log('"F" key pressed');
      };

      document.addEventListener("keydown", handleKeyPress);

      return () => {
        document.removeEventListener("keydown", handleKeyPress);
      };
    }, []);

    return <>Press F to pay Respects</>;
  }
  return (
    <>
      <div className="fixed w-full h-full">
        <Image
          src="/mmoriball3.png"
          fill
          alt="mmoriball"
          className="-mt-12 transform -translate-y-1/6 scale-75 scale-y-125 scale-x-90"
        />
        <div
          className="overflow-hidden rounded-full fixed h-1/2 w-1/4 top-2 left-1/2 transform scale-150 -translate-x-1/2 translate-y-1/3 z-10 shadow-xl shadow-black"
          style={{
            opacity: "1",
            scale: "1",
            backgroundImage: "url('/mmoriball.png')",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        >
          <Image
            src="/mmoriball2.png"
            fill
            alt="mmoriball"
            object-fit="cover"
            style={{
              animation: "pulse 1s infinite alternate",
              opacity: "0.65",
              position: "absolute",
              zIndex: 1,
              scale: "1.05",
            }}
          />
          <div className="mt-24 h-full relative flex overflow-hidden font-mono z-50">
            {database?.map((character: any, index: number) => (
              <>
                <div className="mt-0 -translate-y-1/2 animate-marquee whitespace-nowrap text-black h-full w-max ">
                  {" "}
                  <div
                    key={Math.floor(Math.random() * database.length)}
                    className="text-2xl  drop-shadow-lg shadow-inherit"
                  >
                    <span className={playerColor(character)}>
                      {" "}
                      {character?.name} <br />
                      <span className="text-black"> Level {character?.level} </span>
                      {character?.race} {character.class}
                    </span>
                  </div>
                </div>
                <div className="mt-4  animate-marquee whitespace-nowrap text-black h-full w-max ">
                  {" "}
                  <div key={Math.floor(Math.random() * database.length)} className="text-3xl">
                    <span className={playerColor(character)}>
                      {" "}
                      {character?.name} <br />
                      <span className="text-black"> Lvl {character?.level} </span>
                      {character?.race} {character.class}
                    </span>
                  </div>
                </div>
                <div className="mt-12 animate-marquee whitespace-nowrap text-black h-full w-max ">
                  {" "}
                  <div key={Math.floor(Math.random() * database.length)} className="text-3xl">
                    <span className={playerColor(character)}>
                      {" "}
                      {character?.name} <br />
                      <span className="text-black"> Lvl {character?.level} </span>
                      {character?.race} {character.class}
                    </span>

                    <br />
                  </div>
                </div>
                <div className="mt-16 -translate-y-1/2 animate-marquee whitespace-nowrap text-black h-full w-max ">
                  {" "}
                  <div key={Math.floor(Math.random() * database.length)} className="text-xl">
                    <span className={playerColor(character)}>
                      {" "}
                      {character?.name} <br />
                      <span className="text-black"> Lvl {character?.level} </span>
                      {character?.race} {character.class}
                    </span>
                    <br />
                  </div>
                </div>
                <div className="mt-24 animate-marquee whitespace-nowrap text-black h-full w-max ">
                  {" "}
                  <div key={Math.floor(Math.random() * database.length)} className="text-l">
                    <span className={playerColor(character)}>
                      {" "}
                      {character?.name} <br />
                      <span className="text-black"> Lvl {character?.level} </span>
                      {character?.race} {character.class}
                    </span>
                  </div>
                </div>
                <div className=" animate-marquee whitespace-nowrap text-black h-full w-max ">
                  {" "}
                  <div key={Math.floor(Math.random() * database.length)} className="text-l">
                    <span className={playerColor(character)}>
                      {" "}
                      {character?.name} <br />
                      <span className="text-black"> Lvl {character?.level} </span>
                      {character?.race} {character.class}
                    </span>
                  </div>
                </div>
              </>
            ))}
          </div>
        </div>
      </div>
      {mmToggle == true ? (
        <div className="flex flex-col items-center justify-center bg-transparent text-black pt-4 -mt-16">
          <div style={{ zIndex: 10 }} className="text-center max-w-xl bg-transparent overflow-hidden rounded-md p-8">
            {dead && dead.length > 0 ? (
              <Slider {...settings}>
                {dead.map((deadCharacter, index) => (
                  <div key={index} className="p-4">
                    {deadCharacter?.name == player?.name ? (
                      <>
                        <div className="border-2 border-gray-500 card mt-4 ml-10 mr-10 text-center text-white font-mono text-xl">
                          <br />
                          <span className="font-bold text-2xl">{player?.name}</span> <br />
                          <span className="font-bold">
                            Level {player?.level} <span>{player?.race}</span>
                            <span> {player?.class}</span>{" "}
                          </span>
                          <br />
                          ---------------------
                          <br />
                          <span className="text-lg text-left">
                            {player?.equipped_items?.map((item: any) => (
                              <div key={item.slot.type}>
                                {item.quality.type == "POOR" ? (
                                  <span className="text-gray-500"> {item.name.en_US}</span>
                                ) : (
                                  <>
                                    {item.quality.type == "COMMON" ? (
                                      <span className="text-white"> {item.name.en_US}</span>
                                    ) : (
                                      <>
                                        {item.quality.type == "UNCOMMON" ? (
                                          <span className="text-green-500"> {item.name.en_US}</span>
                                        ) : (
                                          <>
                                            {item.quality.type == "RARE" ? (
                                              <span className="text-blue-500"> {item.name.en_US}</span>
                                            ) : (
                                              <>
                                                {item.quality.type == "EPIC" ? (
                                                  <span className="text-purple-500"> {item.name.en_US}</span>
                                                ) : (
                                                  <span className="text-orange-500"> {item.name.en_US}</span>
                                                )}
                                              </>
                                            )}
                                          </>
                                        )}
                                      </>
                                    )}
                                  </>
                                )}
                              </div>
                            ))}
                          </span>
                        </div>
                        <br />
                      </>
                    ) : (
                      <>
                        <div className="card mr-3">
                          <div className="font-mono text-xl">
                            In Memoriam to: <br /> {deadCharacter.name}
                          </div>
                          <div>
                            <br />

                            <button
                              className="border-2 border-white text-center rounded-md p-2"
                              onClick={() => playerSelector(index)}
                            >
                              Memento Mori
                            </button>
                            <br />
                          </div>
                          <MyComponent index={index} />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </Slider>
            ) : (
              <div>
                No dead <br /> characters
              </div>
            )}

            <br />
          </div>
        </div>
      ) : (
        <div></div>
      )}

      <div className="card fixed right-20 top-2/3 mt-24 pr-2 z-50 font-mono">
        {!address ? (
          <RainbowKitCustomConnectButton />
        ) : (
          <>
            {!user ? (
              <button
                className="border-2 border-black rounded-md"
                onClick={() => {
                  login();
                }}
              >
                LOGIN WITH BNET
              </button>
            ) : (
              <div>Logged in as {user.battletag}</div>
            )}
          </>
        )}

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
      <div
        className="fixed animate-pulse top-2/3 right-96 mr-96 w-1/5 h-1/5 z-50 mt-14 transform -translate-x-1/2 bg-red-800 border-15 border-red-500"
        onClick={() => {
          mmToggle ? setMmToggle(false) : setMmToggle(true);
        }}
      ></div>
      {infoToggle == true ? (
        <div className="fixed z-50 border-gray-500 font-mono p-4 w-40 h-40 left-96 mr-60 top-96">
          <div
            className="animate-bounce absolute right-20 -left-5 h-80 w-60 scale-x-110 scale-y-110"
            onClick={() => setInfoToggle(!infoToggle)}
          >
            <Image fill className="fixed" src="/question.png" alt="?" />
          </div>
        </div>
      ) : (
        <div className="fixed z-50 bg-black border-2 border-gray-500 font-mono p-4 w-1/2 right-60 mr-60 top-60">
          <span className="absolute right-5" onClick={() => setInfoToggle(!infoToggle)}>
            {"| X |"}{" "}
          </span>
          <span className="font-bold justify-center pl-96">
            💀 Memento Mori 💀
            <br />
            <br />
          </span>
          Once upon a time, in a distant digital universe, countless adventurers thrived. They faced endless battles and
          overcame numerous dangers until they each met their inevitable end. <br /> <br />
          Just like in our reality, death is irreversible. However, the actions of these heroes leave lasting marks that
          resonate beyond their lifespan and reverberate throughout the Multiverse.
          <br />
          <br />
          <span className="font-bold">💀 Memento Mori 💀</span> is an onChain memorial to fallen hardcore adventurers
          which records their unique journey through their gear, their name, race and level at their time of death and
          stores it for use throughout the Metaverse. Stats, images, and other functionality are intentionally omitted
          for others to interpret. Feel free to use MementoMori in any way you want.
        </div>
      )}
    </>
  );
};

export default Home;
