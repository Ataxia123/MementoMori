import Slider from "react-slick";
import { useGlobalState } from "~~/services/store/store";
import { Character, Database, Respect } from "~~/types/appTypes";
import { playerColor, shuffle } from "~~/utils/utils";

const findDatabase = (id: number, database: any[]) => {
  const f = database.filter(x => x.id === id);
  console.log(f[0], "f");
  return f[0];
};

export const AttestationCount = (respected: Respect[], fInChat: Character) => {
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };
  // Once the popup is closed
  //

  if (!respected) return <>No Respected</>;
  const f = respected.filter(x => x.hero === fInChat?.id);
  const count = f.length;
  // const sorted = f.sort((a, b) => attestationCount(b.id) - attestationCount(a.id));

  return (
    <Slider {...settings}>
      count: {count}
      {f?.map((respected, index) => (
        <div key={index} className="p-4">
          <ul>respected.id: {respected.hero}</ul>
        </div>
      ))}
    </Slider>
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
            <div>{respected?.name} </div>
          ) : (
            <div>
              <br />
              <span className="font-bold text-2xl">{respected?.name}</span> <br />{" "}
              <span className="font-bold">
                Level {respected?.level} <span>{respected?.race}</span>
                <span> {respected?.class}</span>{" "}
              </span>
              <br />
              ---------------------
              <br />
              {respected?.equipped_items?.map((item: any) => (
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
  //
  if (!respected) return <></>;
  const respectedShuffle = shuffle(respects);

  return (
    <>
      <Slider {...settings}>
        {respectedShuffle?.map((respected, index) => (
          <div key={index} className="p-4">
            <ul>
              IN MEMORIAN: <br />
              <li className="font-mono-bold text-xl">{findDatabase(respected.hero, respects)?.name}</li>
              <li className="overflow-Y-scroll">
                Prayer: <br />
                {respected.prayer}
              </li>
              <li className="overflow-hidden">Signed: {respected.Attestation.message.recipient}</li>
            </ul>
          </div>
        ))}
      </Slider>
    </>
  );
};
export const StatsDisplay = (props: { database: Database; fInChat: Character }) => {
  const { database, fInChat } = props;

  const TallyDisplay = () => {
    const tally = database.respects?.filter(x => x.hero === fInChat?.id);
    tally.map((respected, index) => (
      <div key={index} className="p-4">
        <ul>
          IN MEMORIAN: <br />
          <li className="font-mono-bold text-xl">{findDatabase(respected.hero, database.respects)?.name}</li>
          <li className="overflow-Y-scroll">
            Prayer: <br />
            {respected.prayer}
          </li>
          <li className="overflow-hidden">Signed: {respected.signer}</li>
        </ul>
      </div>
    ));
  };

  return (
    <div className="card fixed w-80 h-80 left-20 bottom-1/3 mt-24 pr-2 z-50 font-mono">
      FALLEN HEROES: {database.players?.length}
      <br />
      RESPECTS PAID: {database.respects?.length}
      <br />
      MOST RESPECTED 💀:
      <br />
      {!fInChat || !database.respects ? <></> : <MoriDisplay respected={fInChat} respects={database.respects} />}
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
