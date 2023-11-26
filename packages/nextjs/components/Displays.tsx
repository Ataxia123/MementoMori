import Slider from "react-slick";
import { useGlobalState } from "~~/services/store/store";
import { Character, Database, Respect } from "~~/types/appTypes";
import { playerColor, shuffle } from "~~/utils/utils";

const findDatabase = (id: number, database: any[]) => {
  const f = database.filter(x => x.id === id);
  console.log(f[0], "f");
  return f[0];
};

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
                Level {respected?.level} <span>{respected?.race}</span>
                <span>{respected?.class}</span>{" "}
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

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  // Once the popup is closed
  if (!respected) return <></>;
  const respectedShuffle = shuffle(respects);

  return (
    <div className="font-serif text-bold text text-center">
      <span className="text-3xl">
        💀 Memento Mori 💀
        <br />
      </span>
      <div className="border-2 border-white h-60 w-full font-bold">
        Prayers for the Dead
        <br />
        {respectedShuffle?.map((respected, index) => (
          <div key={index} className="p-4">
            <ul>
              IN MEMORIAN: <br />
              <li className="font-mono-bold text-xl">{findDatabase(respected.hero, respects)?.name}</li>
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
