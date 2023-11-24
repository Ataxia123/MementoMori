import { Character } from "~~/types/appTypes";

export function shuffle(array: any[]) {
  if (!Array.isArray(array)) {
    // Handle the case where the input is not an array
    console.error("shuffle function received a non-array input:", array);
    return [];
  }
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle...
  while (currentIndex !== 0) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }

  return array;
}
export const playerColor = (character: Character) => {
  let classString = "font-mono text-black "; // Default text color set to black

  // Determine the text color based on the character's class
  if (character.class == "Druid") {
    classString += "bg-orange-500/50 ";
  } else if (character.class == "Priest") {
    classString += "bg-white/50 ";
  } else if (character.class == "Warlock") {
    classString += "bg-purple-600/50 ";
  } else if (character.class == "Warrior") {
    classString += "bg-orange-900/50 ";
  } else if (character.class == "Paladin") {
    classString += "bg-pink-500/50 ";
  } else if (character.class == "Rogue") {
    classString += "bg-yellow-500/50 ";
  } else if (character.class == "Mage") {
    classString += "bg-blue-50/50 ";
  } else if (character.class == "Shaman") {
    classString += "bg-blue-500/50 ";
  } else {
    classString += "bg-green-500/50 ";
  }

  // Determine the font size based on the character's level
  if (character.level < 10) {
    classString += "text-xs ";
  } else if (character.level >= 10 && character.level < 20) {
    classString += "text-sm ";
  } else if (character.level >= 20 && character.level < 30) {
    classString += "text-base ";
  } else if (character.level >= 30 && character.level < 40) {
    classString += "text-lg ";
  } else if (character.level >= 40 && character.level < 50) {
    classString += "text-xl ";
  } else if (character.level >= 50 && character.level < 60) {
    classString += "text-2xl ";
  } else if (character.level >= 60) {
    classString += "text-3xl ";
  }

  // Add a class for the backdrop glow effect
  classString += "backdrop-filter backdrop-blur-lg text-opacity-100 z-100  hover:brightness-200 ";

  return classString;
};
