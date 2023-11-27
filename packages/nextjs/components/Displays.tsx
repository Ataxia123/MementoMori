import Image from "next/image";
import Slider from "react-slick";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth/RainbowKitCustomConnectButton";
import { useGlobalState } from "~~/services/store/store";
import { Character, Database, Respect } from "~~/types/appTypes";
import { playerColor, shuffle } from "~~/utils/utils";

const AttestationCount = (respects: Respect[]) => {
  const respectCounts = respects.reduce((acc, respect) => {
    acc[respect.hero] = (acc[respect.hero] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostRespectedHeroId = Object.keys(respectCounts).reduce((a, b) =>
    respectCounts[a] > respectCounts[b] ? a : b,
  );
  const mostRespectedCount = respectCounts[mostRespectedHeroId];

  return { heroId: parseInt(mostRespectedHeroId, 10), count: mostRespectedCount };
};

export const MainDisplay = (props: {
  mmToggle: boolean;
  dead: Character[];
  player: Character;
  playerSelector: (index: number) => void;
  address: string;
  user: any;
  fInChat: Character;
}) => {
  const { mmToggle, dead, fInChat, player, playerSelector, address, user } = props;
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
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

export const InfoDisplay = (props: {
  mmToggle: boolean;
  setMmToggle: (mmToggle: boolean) => void;
  infoToggle: boolean;
  setInfoToggle: (infoToggle: boolean) => void;
  tutoggle: boolean;
  setTutoggle: (tutoggle: boolean) => void;
  playSpaceshipOn: () => void;
}) => {
  const { mmToggle, setMmToggle, infoToggle, setInfoToggle, tutoggle, setTutoggle, playSpaceshipOn } = props;
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

          <br />
          {tutoggle == true ? (
            <div
              onClick={e => {
                e.stopPropagation();
                playSpaceshipOn();
                setTutoggle(!tutoggle);
              }}
            >
              Once upon a time, in a distant digital universe, countless adventurers thrived. They faced endless battles
              and overcame numerous dangers until they each met their inevitable end. <br /> <br />
              Just like in our reality, death is irreversible. However, the actions of these heroes leave lasting marks
              that resonate beyond their lifespan and reverberate throughout the Multiverse. Ancient magicians harnessed
              the power of the secret flame to create...
              <br />
              <br />
              <span className="font-bold">💀 Memento Mori 💀</span> <br />
              <br />
              An onChain memorial to fallen hardcore adventurers which records their unique journey through their gear,
              their name, race and level at their time of death and stores it for use throughout the Metaverse. Stats,
              images, and other functionality are intentionally omitted for others to interpret. Feel free to use
              MementoMori in any way you want.
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
export const RespectedDisplay = (props: { respected: Character }) => {
  const { respected } = props;
  return (
    <>
      <div className="border-2 border-gray-500 card mt-4 ml-10 mr-10 text-center text-white font-mono text-xl">
        <>
          {" "}
          💀 Memento Mori 💀
          {!respected.equipped_items || respected.equipped_items.length <= 1 ? (
            <div>{respected?.name}</div>
          ) : (
            <div>
              <br />
              <span className="font-bold text-2xl">{respected?.name}</span> <br />{" "}
              <span className="font-bold">
                Level {respected?.level} <span>{respected?.race}</span> <span>{respected?.class}</span>{" "}
              </span>
              <br />
              ---------------------
              <br />
              {respected?.equipped_items?.map((item: any) => {
                let textColor = "";
                if (item.quality.type == "POOR") {
                  textColor = "text-gray-500";
                } else if (item.quality.type == "COMMON") {
                  textColor = "text-white";
                } else if (item.quality.type == "UNCOMMON") {
                  textColor = "text-green-500";
                } else if (item.quality.type == "RARE") {
                  textColor = "text-blue-500";
                } else if (item.quality.type == "EPIC") {
                  textColor = "text-purple-500";
                } else {
                  textColor = "text-orange-500";
                }
                return (
                  <div key={item.slot.type}>
                    <span className={textColor}>{item.name.en_US}</span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      </div>
      <br />
    </>
  );
};

export const MoriDisplay = (props: { respected: Character; respects: Respect[] }) => {
  const { respected, respects } = props;
  // Once the popup is closed
  if (!respected) return <></>;
  const respectedShuffle = shuffle(respects);

  return (
    <div className="font-mono text-bold text text-center">
      <span className="text-3xl">
        💀 Memento Mori 💀
        <br />{" "}
      </span>

      <div className="h-60 w-full font-bold overflow-auto">
        <span className="font-bold text-xl">Prayers for {respected.name}</span>
        <br />
        {respectedShuffle?.map((respected, index) => (
          <div key={index} className="p-4">
            <ul>
              IN MEMORIAN: <br />
              <li className="text-sm">
                Prayer: <br />
                {respected.prayer}
              </li>
              <li className="">
                Signed:{" "}
                {respected.Attestation.message.recipient.slice(respected.Attestation.message.recipient.length - 5)}
              </li>
            </ul>
          </div>
        ))}
        <span className="">Fs On Chain: {respectedShuffle.length}</span>
      </div>
    </div>
  );
};
export const StatsDisplay = (props: {
  fInChat: Character;
  setPrayer: (prayer: string) => void;
  prayer: string;
  pressFtoPayRespects: (fInChat: Character, prayer: string) => void;
  FsInChat: (props: { fInChat: Character }) => JSX.Element;
}) => {
  const { fInChat, setPrayer, prayer, pressFtoPayRespects, FsInChat } = props;
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
                  <FsInChat fInChat={fInChat as Character} />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export const BallDiv = (props: { players: Character[] }) => {
  const { players } = props;
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
        <CharacterDisplay players={players} />
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

export const UserDisplay = (props: {
  setHidden: (hidden: boolean) => void;
  hidden: boolean;
  database: Database;
  fInChat: Character;
  address: string;
  blockNumber: bigint;
}) => {
  const { database, fInChat, address, blockNumber, setHidden, hidden } = props;
  const tally = database.respects?.filter(x => x.hero === fInChat?.id);
  const user = useGlobalState(state => state.user);
  return (
    <div className="card fixed right-20 top-1/6 w-2/8 mt-0 pr-2 z-50 font-mono border-2 color-white">
      <div className="p-6 justify-items-center border-2 color-white">
        <br />
        <div className="border-2 color-white top-2 right-0 h-72 w-full">
          <MoriDisplay respected={fInChat} respects={tally} />
        </div>
        <br />
        FALLEN HEROES: {database.players?.length}
        <br />
        TOTAL RESPECTS PAID: {database.respects?.length}
        <br />
      </div>
      <div className="p-6 justify-items-center border-2 color-white">
        <span>Respects paid by {address?.slice(address.length - 5) || "no data"}</span> <br />
        <span> {"User:" + user.battleTag}</span>
        <br />
        block:{blockNumber ? blockNumber.toString() : "no data"}
        <br />
        <RainbowKitCustomConnectButton />
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

export const CharacterDisplay = (props: { players: Character[] }) => {
  const { players } = props;
  // Shuffle the database array before rendering
  const shuffledDatabase = shuffle(players);
  const setFinChat = useGlobalState(state => state.setPlayer);

  // Define the number of rings and distribute the characters among them
  const numberOfRings = 20; // Adjust this number as needed
  const charactersPerRing = Math.ceil(shuffledDatabase.length / numberOfRings);
  const rings = [];

  for (let i = 0; i < numberOfRings; i++) {
    const start = i * charactersPerRing;
    const end = start + charactersPerRing;
    rings.push(shuffledDatabase.slice(start, end));
  }

  return (
    <div className="sphere-container">
      {rings.map((ring, ringIndex) => (
        <div key={ringIndex} className={`ring ring-${ringIndex}`}>
          {ring.map((character: Character) => (
            <>
              <div
                key={character.id}
                className="character mt-0 -translate-y-1/2 animate-marquee2 whitespace-nowrap h-full w-max"
              >
                <button
                  className={playerColor(character)}
                  onClick={() => {
                    const frespected = players.filter(x => x.id === character.id);
                    setFinChat(frespected[0]);
                  }}
                >
                  {character.name} <br />
                </button>
              </div>
            </>
          ))}
        </div>
      ))}
    </div>
  );
};
