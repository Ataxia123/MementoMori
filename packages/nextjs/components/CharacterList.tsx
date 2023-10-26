import { Character } from "../types/index";
import Slider from "react-slick";

interface Props {
  deadCharacters: Character[];
  setPlayer: (character: Character) => void;
  settings: {
    dots: boolean;
    infinite: boolean;
    speed: number;
    slidesToShow: number;
    slidesToScroll: number;
  };
}

const CharacterSlider: React.FC<Props> = ({ deadCharacters, setPlayer }) => {
  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="flex justify-center items-center">
      <div className="border-2 border-white text-center max-w-xl overflow-hidden rounded-md p-8">
        {deadCharacters && deadCharacters.length > 0 ? (
          <Slider {...settings}>
            {deadCharacters.map((deadCharacter, index) => (
              <div key={index} className="p-4">
                <div className="card">
                  <div>Name: {deadCharacter.name}</div>
                  <div>Level: {deadCharacter.level}</div>
                  <div>Race: {deadCharacter.race}</div>
                  <div>Class: {deadCharacter.class}</div>
                  <div>
                    <br />
                    <button
                      className="border-2 border-black text-center rounded-md"
                      onClick={() => setPlayer(deadCharacter)}
                    >
                      Select
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        ) : (
          <div>No dead characters</div>
        )}
      </div>
    </div>
  );
};

export default CharacterSlider;
