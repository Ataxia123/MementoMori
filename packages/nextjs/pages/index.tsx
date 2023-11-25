import { useCallback, useEffect, useRef, useState } from "react";
import React from "react";
import Image from "next/image";
import { useEthersProvider, useEthersSigner } from "../utils/wagmi-utils";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import type { NextPage } from "next";
import toast from "react-hot-toast";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { useAccount, useBlockNumber } from "wagmi";
import AudioController from "~~/components/AudioController";
import { CharacterDisplay, MoriDisplay, RespectedDisplay, StatsDisplay } from "~~/components/Displays";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { Character, Database, Respect, Sounds } from "~~/types/appTypes";

const Home: NextPage = () => {
  const [players, setPlayers] = useState<any[]>();
  const [dead, setDead] = useState<Character[]>([]);
  const [alive, setAlive] = useState<Character[]>([]);

  const [player, setPlayer] = useState<Character | undefined>();
  const [mmToggle, setMmToggle] = useState<boolean>(false);
  const [infoToggle, setInfoToggle] = useState<boolean>(false);
  const [tutoggle, setTutoggle] = useState<boolean>(true);

  const [prayer, setPrayer] = useState<string>("💀 Memento Mori 💀");
  const [isPayingRespects, setIsPayingRespects] = useState<boolean>(false);
  const [hidden, setHidden] = useState<boolean>(false);
  const [sounds, setSounds] = useState<Sounds>({});
  const [audioController, setAudioController] = useState<AudioController | null>(null);
  const [soundsLoaded, setSoundsLoaded] = useState<boolean>(false);
  const fInChat = useGlobalState(state => state.player);
  const user = useGlobalState(state => state.user);
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const database = useGlobalState(state => state.database);
  const url = process.env.NEXT_PUBLIC_WEBSITE || "http://localhost:3000";

  const { data: blockNumber, isError, isLoading } = useBlockNumber();
  const loadSounds = useCallback(async () => {
    const spaceshipOn = await audioController?.loadSound("/firesound.wav");

    if (spaceshipOn) {
      audioController?.playSound(spaceshipOn, true, 0.02);
      // Pass 'true' as the second argument to enable looping
    }

    setSounds({
      spaceshipOn,
    });

    setSoundsLoaded(true);
  }, [audioController, soundsLoaded]);
  // AUDIO SETUP
  //
  useEffect(() => {
    setAudioController(new AudioController());
  }, []);

  useEffect(() => {
    if (audioController && !soundsLoaded) {
      loadSounds();
    }
  }, [audioController, soundsLoaded, loadSounds]);

  useEffect(() => {
    if (sounds.spaceshipOn) {
      audioController?.playSound(sounds.spaceshipOn, true, 0.02);
    }
  }, [sounds.spaceshipOn]);
  useEffect(() => {
    console.log(blockNumber);
  }, [blockNumber]);

  function playSpaceshipOn() {
    if (sounds.spaceshipOn) {
      audioController?.playSound(sounds.spaceshipOn, true, 0.02);
    }
  }

  const EASContractAddress = "0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587"; //
  // Initialize the sdk with the address of the EAS Schema contract address
  const eas = new EAS(EASContractAddress);

  // Gets a default provider (in production use something else like infura/alchemy)
  eas.connect(provider);

  // Initialize the sdk with the Provider
  const account = useAccount();

  const address = account?.address;

  // LOGIN METHODS

  const postDb = async (players: Character) => {
    try {
      const response = await fetch(url + "/api/db", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(players),
      });

      const data = await response.json();
      console.log(data, "POST Player data response");
    } catch (e: any) {
      toast.error("error posting dead players to db");
      console.log(e.message);
    }
  };

  const postRespects = async (players: { uid: string; id: number; prayer: string; attestation: string }) => {
    try {
      const response = await fetch(url + "/api/attest", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(players),
      });

      const data = await response.json();
      console.log(data, "POST Player data response");
    } catch (e: any) {
      toast.error("error posting dead players to db");
      console.log(e.message);
    }
  };

  const payRespects = async (respected: Character, prayer: string) => {
    const offchain = await eas.getOffchain();

    //
    const uid = "0xb3009a8935a592fdf37095ac54ada825b2bf5b8917d4f4ce5e1726459ff517ec";

    // Initialize SchemaEncoder with the schema string
    const schemaEncoder = new SchemaEncoder("uint32 moriRef,string prayer");

    console.log(respected, "respected");

    const encodedData = schemaEncoder.encodeData([
      { name: "moriRef", value: respected.id, type: "uint32" },
      { name: "prayer", value: prayer, type: "string" },
    ]);

    if (!signer) {
      console.log("No signer available.");
      return;
    }

    const offchainAttestation = await offchain.signOffchainAttestation(
      {
        version: 1,
        recipient: address ? address : "0x0000000000000000",
        expirationTime: BigInt(0),
        time: blockNumber ? blockNumber : BigInt(0),
        revocable: true,
        refUID: "0x0000000000000000000000000000000000000000000000000000000000000000",
        // Be aware that if your schema is not revocable, this MUST be false
        schema: uid,
        data: encodedData,
      },
      signer,
    );

    const updatedData = JSON.stringify(
      offchainAttestation,
      (key, value) => (typeof value === "bigint" ? value.toString() : value), // return everything else unchanged
    );

    console.log(updatedData, "updatedData");

    const f = { uid: offchainAttestation.uid, id: respected.id, prayer: prayer, attestation: updatedData };

    await postRespects(f);
    return updatedData;
  };

  const pressFtoPayRespects = async (respected: Character, prayer: string): Promise<string | undefined> => {
    try {
      // Finished state update before assigning player
      // Fetch Attestation
      const udata = await payRespects(respected, prayer);
      console.log(udata, "player");
      toast.success("Fs on chain for " + respected.name);
      return udata;
    } catch (e: any) {
      console.error(e);
      return undefined;
    }
  };

  const fecthAttestation = async (index: number) => {
    await fetchCharMedia(index).then(async () => {
      const offchain = await eas.getOffchain();

      //
      const uid = "0x633a741c3514c35e4fea835f5a1e4f4e6eb4b049e73c381080e7bd2923158571";

      // Initialize SchemaEncoder with the schema string
      const schemaEncoder = new SchemaEncoder(
        "address Owner,uint32 PlayerId,string Name,string Race,string Class,string Level,string[] EquippedItems",
      );
      if (!dead[index]) return console.log("No player available at." + index);

      const encodedData = schemaEncoder.encodeData([
        { name: "Owner", value: address ? address : "0x0000000000000000", type: "address" },
        { name: "PlayerId", value: dead[index].id, type: "uint32" },
        { name: "Name", value: dead[index].name, type: "string" },
        { name: "Race", value: dead[index].race, type: "string" },
        { name: "Class", value: dead[index].class, type: "string" },
        { name: "Level", value: dead[index].level, type: "string" },
        { name: "EquippedItems", value: dead[index].equipped_items, type: "string[]" },
      ]);

      if (!signer) {
        console.log("No signer available.");
        return;
      }

      const offchainAttestation = await offchain.signOffchainAttestation(
        {
          version: 1,
          recipient: address ? address : "0x0000000000000000",
          expirationTime: BigInt(0),
          time: blockNumber ? blockNumber : BigInt(0),
          revocable: true,
          refUID: "0x0000000000000000000000000000000000000000000000000000000000000000",
          // Be aware that if your schema is not revocable, this MUST be false
          schema: uid,
          data: encodedData,
        },
        signer,
      );

      const updatedData = JSON.stringify(
        offchainAttestation,
        (key, value) => (typeof value === "bigint" ? value.toString() : value), // return everything else unchanged
      );

      dead[index].Attestation = updatedData;
      console.log(updatedData, "updatedData");
    });
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
      const index2 = database.players.findIndex(x => x.id === data._id);

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

  const fetchCharMedia = async (index: number): Promise<void> => {
    if (!user?.token) {
      console.log("No token available.");
      return;
    }
    return new Promise(async (resolve, reject) => {
      try {
        // Ensure the dead array has elements and the index is valid
        if (dead.length === 0 || index < 0 || index >= dead.length) {
          console.log("Invalid index or empty dead array.");
          return;
        }

        const characterMedia = dead[index];

        if (!characterMedia?.media) {
          console.log(`No media URL found for character at index ${index}.`);
          return;
        }

        const url = `${characterMedia.media}&access_token=${user.token}`;
        const response = await fetch(url);
        const data = await response.json();

        const dindex = dead.findIndex(x => x.id === data.character.id);

        if (dindex === -1) {
          console.log("Character not found in dead array.");
          reject(); // reject the promise if not found
          return;
        }
        setDead(prevState => {
          const newState = [...prevState];
          newState[index].equipped_items = data.equipped_items;
          return newState;
        });
        setPlayer(dead[index]);
        resolve(); // resolve the promise after successfully updating state
      } catch (e: any) {
        toast.error("Error getting equipment: " + e.message);
        console.log(e);
        reject(e); // reject the promise in case of error
      }
    });
  };

  const fetchCharMediaAndAttestation = async (index: number): Promise<Character | null> => {
    try {
      // Finished state update before assigning player
      // Fetch Attestation
      await fecthAttestation(index);
      const player = dead[index];
      console.log(player, "player");
      return player;
    } catch (e: any) {
      console.error(e);
      return null;
    }
  };

  const playerSelector = async (index: number) => {
    const playerData = await fetchCharMediaAndAttestation(index);
    if (!playerData) return;
    await postDb(playerData);

    toast.success("Memento Mori" + playerData.name);
  };

  useEffect(() => {
    playSpaceshipOn();
    // Setting the initial volume to 50%
  }, []);

  useEffect(() => {
    if (!user.token || user.token === "notyet") return;
    fetchCharacter();
  }, [user]);

  useEffect(() => {
    players?.map((character: any) => {
      if (character.level < 10)
        return console.log(character.character.name, "too low level", character.character.level);
      fetchCharData(character.character.href);
    });
  }, [players]);

  useEffect(() => {
    if (isPayingRespects == true && fInChat) {
      try {
        pressFtoPayRespects(fInChat, prayer);
      } catch (e: any) {
        console.error(e);
      }

      setIsPayingRespects(false);
    }
  }, [isPayingRespects]);

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  // Once the popup is closed
  //

  function FsInChat(props: any) {
    const { fInChat } = props;
    const componentRef = useRef(null); // Reference to the component

    useEffect(() => {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Component is visible, add event listener
            document.addEventListener("keydown", handleKeyPress);
          } else {
            // Component is not visible, remove event listener
            document.removeEventListener("keydown", handleKeyPress);
          }
        });
      });

      const handleKeyPress = (event: any) => {
        if (event.key === "F" || event.key === "f") {
          setIsPayingRespects(true);
        }
      };

      if (componentRef.current) {
        observer.observe(componentRef.current); // Start observing
      }

      return () => {
        if (componentRef.current) {
          observer.unobserve(componentRef.current); // Clean up
        }
        document.removeEventListener("keydown", handleKeyPress);
      };
    }, [fInChat]);

    return <div ref={componentRef}>Press F to pay Respects</div>;
  }
  const UserDisplay = () => {
    return (
      <div className="card fixed right-20 top-1/4 mt-14 pr-2 z-50 font-mono">
        {!address ? <RainbowKitCustomConnectButton /> : <>💀 Memento Mori 💀</>}
        <div className="ml-20 p-6 justify-items-center">
          <span>Address: {address?.slice(address.length - 5) || "no data"}</span> <br />
          <span>User: {user ? user.battleTag : "no data"}</span>
          <br />
          <button
            className="text-red-500 hover:text-blue-500"
            onClick={e => {
              e.stopPropagation();
              setHidden(!hidden);
            }}
          >
            {"| HIDE UI |"}{" "}
          </button>
          <br />
        </div>
      </div>
    );
  };
  const InfoDisplay = () => {
    return (
      <>
        <div
          className="fixed -mt-10 top-2/3 left-1/2 w-1/4 h-1/3 z-50 transform -translate-x-1/2 scale-100 hover:scale-105"
          onClick={() => {
            mmToggle ? setMmToggle(false) : setMmToggle(true);
          }}
        >
          <Image src="/logo.png" alt="Logo" fill />
        </div>
        {infoToggle == true ? (
          <div className="fixed z-50 border-gray-500 right-12 mr-12 mt-10 bottom-4/5 scale-50">
            <div
              className="animate-bounce absolute right-20 -left-6 h-80 w-60 scale-x-110 scale-y-110"
              onClick={() => setInfoToggle(!infoToggle)}
            >
              <Image fill className="fixed hover:scale-110" src="/question.png" alt="?" />
            </div>
          </div>
        ) : (
          <div className="fixed z-50 bg-black border-2 text-center border-gray-500 font-mono p-4 w-1/2 right-60 mr-60 top-20">
            <br />
            Block Number: {blockNumber ? blockNumber.toString() : "no data"}
            <br />
            {tutoggle == true ? (
              <div
                onClick={e => {
                  e.stopPropagation();
                  playSpaceshipOn();
                  setTutoggle(!tutoggle);
                }}
              >
                Once upon a time, in a distant digital universe, countless adventurers thrived. They faced endless
                battles and overcame numerous dangers until they each met their inevitable end. <br /> <br />
                Just like in our reality, death is irreversible. However, the actions of these heroes leave lasting
                marks that resonate beyond their lifespan and reverberate throughout the Multiverse. Ancient magicians
                harnessed the power of the secret flame to create...
                <br />
                <br />
                <span className="font-bold">💀 Memento Mori 💀</span> <br />
                <br />
                An onChain memorial to fallen hardcore adventurers which records their unique journey through their
                gear, their name, race and level at their time of death and stores it for use throughout the Metaverse.
                Stats, images, and other functionality are intentionally omitted for others to interpret. Feel free to
                use MementoMori in any way you want.
                <br />
                <br />
                Pay <span className="text-red-500">respects</span> to the fallen heroes by signing their attestation and
                leaving a prayer. <br />
                <br />
                <br />
                <div className="font-bold text-center">💀 Fs on Chain 💀</div>
              </div>
            ) : (
              <div
                className="p-40 
        text - center"
                onClick={() => {
                  setInfoToggle(!infoToggle);
                  setTutoggle(!tutoggle);
                }}
              >
                <span className="font-bold">
                  This project is dedicated to the memory of my dog 🐶 Tuto.
                  <br />
                  <br />F
                </span>
              </div>
            )}
          </div>
        )}
      </>
    );
  };
  const BallDiv = () => {
    return (
      <div className="fixed w-full h-full">
        <Image
          src="/mmoriball3.png"
          fill
          alt="mmoriball"
          className="-mt-12 transform -translate-y-1/6 scale-75 scale-y-125 scale-x-90"
        />
        <div
          className="fixed overflow-hidden rounded-full h-1/2 w-1/4 top-2 left-1/2 transform scale-150 -translate-x-1/2 translate-y-1/3 shadow-xl shadow-black"
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
              opacity: "0.75",
              position: "absolute",
              scale: "1.05",
              pointerEvents: "none",
            }}
          />
          <CharacterDisplay players={database.players} />
          <Image
            src="/mmoriball2.png"
            fill
            alt="mmoriball"
            object-fit="cover"
            style={{
              animation: "pulse 1s infinite alternate",
              opacity: "0.25",
              position: "absolute",
              scale: "1.05",
              pointerEvents: "none",
            }}
          />
        </div>
      </div>
    );
  };
  const MainDisplay = () => {
    return (
      <>
        {mmToggle == true ? (
          <div className="flex flex-col items-center justify-center bg-transparent text-black pt-4 -mt-16">
            <div style={{ zIndex: 10 }} className="text-center max-w-xl bg-transparent overflow-hidden rounded-md p-8">
              {dead && dead.length > 0 ? (
                <Slider {...settings}>
                  {dead.map((deadCharacter, index) => (
                    <div key={index} className="p-4">
                      {deadCharacter?.name == player?.name ? (
                        <>
                          <RespectedDisplay respected={player} />
                        </>
                      ) : (
                        <div className="card mr-3 mt-4">
                          <div className="font-mono text-xl">
                            In Memorian of: <br /> {deadCharacter.name}
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
                        </div>
                      )}
                    </div>
                  ))}
                </Slider>
              ) : (
                <div className="card mt-60 pr-2 z-50 font-mono">
                  {!address ? (
                    <>connect wallet</>
                  ) : (
                    <>{!user ? <>LOGIN WITH BNET</> : <div>Logged in as {user.battleTag}</div>}</>
                  )}
                </div>
              )}

              <br />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center bg-transparent text-black p-4 pt-4 -mt-16">
            <div style={{ zIndex: 10 }} className="text-center max-w-xl bg-transparent overflow-hidden rounded-md p-8">
              <RespectedDisplay respected={fInChat} />
            </div>
          </div>
        )}{" "}
      </>
    );
  };
  const StatsDisplay = () => {
    const tally = database.respects?.filter(x => x.hero === fInChat?.id);

    return (
      <div className="card fixed w-80 h-80 left-20 bottom-1/3 mt-24 pr-2 z-50 font-mono">
        <div className="card mr-3 mt-4">
          {!fInChat ? (
            <>SELECT A HERO</>
          ) : (
            <div className="font-mono text-xl">
              {!fInChat.name ? "HERE BE THE DEAD" : "In Memorian of:"} <br />
              <span className="font-bold">{fInChat?.name}</span>
              <div>
                <br />

                <form>
                  <label className={"text-black"}>
                    <input
                      type="text"
                      value={prayer}
                      onChange={e => {
                        e.stopPropagation();
                        setPrayer(e.target.value);
                      }}
                    />
                  </label>
                  <br />
                  <br />
                  <button
                    className="border-2 border-white text-center rounded-md p-2"
                    onClick={e => {
                      e.preventDefault();
                      if (!fInChat) return;
                      pressFtoPayRespects(fInChat, prayer);
                    }}
                  >
                    <FsInChat />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
        FALLEN HEROES: {database.players?.length}
        <br />
        RESPECTS PAID: {database.respects?.length}
        <br />
        <MoriDisplay respected={fInChat} respects={tally} />
        <br />
        {!fInChat.name ? <></> : <MoriDisplay respected={fInChat} respects={database.respects} />}
      </div>
    );
  };
  // Fisher-Yates (Knuth) shuffle algorithm
  return (
    <>
      <BallDiv />
      {hidden == true ? <></> : <MainDisplay />}
      {/*login logo pulse portion and ? thing*/}
      <UserDisplay />
      <StatsDisplay />

      <InfoDisplay />
    </>
  );
};

export default Home;
