import { useCallback, useEffect, useRef, useState } from "react";
import React from "react";
import Image from "next/image";
import { INITIAL_CONFIG } from "../config-dummy";
import { useEthersProvider, useEthersSigner } from "../utils/wagmi-utils";
import { EAS, SchemaEncoder } from "@ethereum-attestation-service/eas-sdk";
import type { NextPage } from "next";
import toast from "react-hot-toast";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import { useAccount, useBlockNumber } from "wagmi";
import AudioController from "~~/components/AudioController";
import { BallDiv, InfoDisplay, MainDisplay, StatsDisplay, UserDisplay } from "~~/components/Displays";
import { Buttons, Modal } from "~~/components/Modals";
import * as S from "~~/components/Modals/styles";
import { useGlobalState } from "~~/services/store/store";
import { Character, Database, Filter, Respect, Sounds } from "~~/types/appTypes";

const Home: NextPage = () => {
  const [show1, setShow1] = useState<boolean>(true);
  const [show2, setShow2] = useState<boolean>(false);
  const [show4, setShow4] = useState<boolean>(false);
  const [players, setPlayers] = useState<any[]>();
  const [dead, setDead] = useState<Character[]>([]);
  const [alive, setAlive] = useState<Character[]>([]);

  const [player, setPlayer] = useState<Character | undefined>();
  const [mmToggle, setMmToggle] = useState<boolean>(false);
  const [tutoggle, setTutoggle] = useState<boolean>(true);

  const [prayer, setPrayer] = useState<string>("💀 Memento Mori 💀");
  const [isPayingRespects, setIsPayingRespects] = useState<boolean>(false);
  const [hidden, setHidden] = useState<boolean>(false);
  const [sounds, setSounds] = useState<Sounds>({});

  const [filter, setFilter] = useState<Filter>({});
  const [audioController, setAudioController] = useState<AudioController | null>(null);
  const [soundsLoaded, setSoundsLoaded] = useState<boolean>(false);
  const fInChat = useGlobalState(state => state.player);
  const user = useGlobalState(state => state.user);
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const database = useGlobalState(state => state.database);
  const url = process.env.NEXT_PUBLIC_WEBSITE || "http://localhost:3000";

  const setUser = useGlobalState(state => state.setUser);
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

  let popup: Window | null = null;

  const login = () => {
    popup = window.open(
      url + "/oauth/battlenet",
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
        if (event.origin !== url) return;
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
      const response = await fetch(url + "/oauth/logout", {
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

  const EASContractAddress = "0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587"; //
  // Initialize the sdk with the address of the EAS Schema contract address
  const eas = new EAS(EASContractAddress);

  // Gets a default provider (in production use something else like infura/alchemy)
  eas.connect(provider);

  // Initialize the sdk with the Provider
  const account = useAccount();

  const address = account?.address;

  // LOGIN METHODS
  async function createUrlAndCopy(fInChat: Character): Promise<void> {
    const filter = { name: fInChat?.name, class: fInChat?.class, race: fInChat?.race, level: fInChat?.level } as Filter;
    const baseUrl = "https://mmorionchain.com/";
    const queryParams = new URLSearchParams();

    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const urlWithParams = `${baseUrl}?${queryParams.toString()}`;
    await navigator.clipboard.writeText(urlWithParams);
  }

  function loadFilterFromUrl(filter: Filter): Filter {
    const urlParams = new URLSearchParams(window.location.search);
    Object.keys(filter).forEach(key => {
      const value = urlParams.get(key);
      if (value !== null) {
        if (key === "level") {
          const level = parseInt(value, 10);
          if (!isNaN(level)) {
            filter[key as keyof Filter] = level as any;
          }
        } else {
          filter[key as keyof Filter] = value as any;
        }
      }
    });

    return filter;
  }
  useEffect(() => {
    loadFilterFromUrl(filter);
    console.log(filter, "filter");
    // Setting the initial volume to 50%
  }, [database]);

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
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "F" || event.key === "f") {
        setShow2(true);
      }
    };

    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  const handlePayRespects = () => {
    if (!fInChat.name) return toast.error("No one in chat");
    setIsPayingRespects(true);
    setShow2(false);
  };

  function FsInModal(props: { fInChat: Character }) {
    return (
      <>
        <div className="text-center border-2 color-white p-1">💀 Memento Mori 💀</div>
        {!fInChat.name && <div>No one in chat</div>}
        {!show2 && <div>Press F to pay Respects</div>}
      </>
    );
  }

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
      <Modal show={show1} setShow={setShow1} config={INITIAL_CONFIG.modal1}>
        <h1>My Modal 1</h1>
        <InfoDisplay
          infoToggle={show1}
          setInfoToggle={setShow1}
          tutoggle={tutoggle}
          setTutoggle={setTutoggle}
          playSpaceshipOn={playSpaceshipOn}
          mmToggle={mmToggle}
          setMmToggle={setMmToggle}
        />
        <S.ModalFooter>
          <S.ModalButtonSecondary onClick={() => setShow1(!show1)}>Cancel</S.ModalButtonSecondary>
          <S.ModalButtonPrimary>Acept</S.ModalButtonPrimary>
        </S.ModalFooter>
      </Modal>

      <Modal show={show2} setShow={setShow2} config={INITIAL_CONFIG.modal2}>
        <>
          <div className="text-center border-2 color-white p-20 mb-52  bg-black">
            <span className="text-2xl font-bold">💀 Memento Mori 💀</span>
            <br />
            <br />
            <>
              {!fInChat.name && <> Select a Hero</>}
              {fInChat.name && (
                <>
                  <span className="text-xl font-bold">
                    {fInChat.name}
                    {"level"}
                    {fInChat.level} {fInChat.race} {fInChat.class}
                  </span>{" "}
                </>
              )}
            </>
            <br />
            <br />
            <input
              type="text"
              className="pl-10"
              placeholder="A prayer for the fallen"
              onChange={e => {
                setPrayer(e.target.value);
              }}
            />
            <br />
            {isPayingRespects && <div>Respects paid.</div>}
            <S.ModalFooter>
              <div className="text-center">
                <button onClick={handlePayRespects} className="color-white p-1 hover:bg-red-500">
                  Pay Respects
                </button>
                <br />

                <br />
                <button
                  className="text-red-500 p-1 hover:text-blue-500"
                  onClick={() => {
                    createUrlAndCopy(fInChat);
                    toast.success("Copied to clipboard");
                  }}
                >
                  Share
                </button>
              </div>
            </S.ModalFooter>
          </div>
        </>
      </Modal>

      <Modal show={show4} setShow={setShow4} config={INITIAL_CONFIG.modal4}>
        <h1>My Modal 4</h1>
        <p>Reusable Modal with options to customize.</p>
      </Modal>
      <BallDiv players={database.players} />
      {show1 == true || show2 == true ? (
        <></>
      ) : (
        <MainDisplay
          mmToggle={mmToggle}
          dead={dead}
          player={player as Character}
          playerSelector={playerSelector}
          address={address as string}
          user={user}
          fInChat={fInChat}
          login={login}
        />
      )}
      <UserDisplay
        database={database}
        fInChat={fInChat}
        address={address ? address : "no data"}
        blockNumber={blockNumber ? blockNumber : BigInt(0)}
        setHidden={setHidden}
        hidden={hidden}
        setShow1={setShow1}
        show1={show1}
        logout={logout}
        login={login}
      />

      <StatsDisplay
        fInChat={fInChat}
        setPrayer={setPrayer}
        prayer={prayer}
        pressFtoPayRespects={pressFtoPayRespects}
        FsInChat={FsInModal}
        respected={database.respects}
        players={database.players}
        filter={filter as Filter}
        setFilter={setFilter}
        setShowModal2={setShow2}
      />
    </>
  );
};

export default Home;
