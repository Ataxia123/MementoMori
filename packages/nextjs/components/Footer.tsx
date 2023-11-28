import Image from "next/image";

export const Footer = () => {
  return (
    <div className="fixed flex w-full h-1/4 z-10 p-4 bottom-1/3 left-0 pointer-events-none">
      <Image
        src="/femock33.png"
        fill
        alt="footer"
        style={{ pointerEvents: "none", objectFit: "cover", overflow: "visible" }}
      />

      <div className="fixed items-left justify-left w-full h-15 left-0 bottom-0  pointer-events-auto text-center font-mono font-bold backdrop-blur-lg text-black">
        {" "}
        Made with <span className="text-red-500">{"<3"}</span> by <span className="text-white">At0x.eth </span>and the{" "}
        <span className="text-green-500">N</span>
        <span className="text-red-500">E</span>
        <span className="text-yellow-200">R</span>
        <span className="text-purple-400">D</span>
        <span className="text-blue-500">S</span>
        <span className="text-blue-700">
          {" "}
          <br />
          <a href="https://discord.gg/yGuUY8ZsFr" target="_blank" rel="noreferrer">
            Discord |
          </a>
        </span>
        <span className="text-blue-800">
          {" "}
          <a href="https://t.me/+N_-pUunbjHw3Y2Vh" target="_blank" rel="noreferrer">
            Telegram |
          </a>
        </span>
        <span className="text-blue-800">
          {" "}
          <a href="https://twitter.com/MMoriOnChain" target="_blank" rel="noreferrer">
            Twitter |
          </a>
        </span>
        <span className="text-blue-800">
          {" "}
          <a href="https://github.com/Ataxia123/MementoMori" target="_blank" rel="noreferrer">
            Github |
          </a>
        </span>
      </div>

      <div className=" pointer-events-none overflow-hidden rounded-full fixed h-2/3 w-1/3 top-1/4 -mt-40 right-1/3 scale-125 shadow-xl shadow-black">
        <Image src="/mmoriflame.gif" alt="Logo" fill className="  brightness-50 opacity-25" />
      </div>
    </div>
  );
};
