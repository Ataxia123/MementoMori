import Image from "next/image";

export const Footer = () => {
  return (
    <div className="fixed flex items-center w-full h-1/4 z-10 p-4 bottom-1/3 left-0 pointer-events-none">
      <Image
        src="/femock33.png"
        fill
        alt="footer"
        style={{ pointerEvents: "none", objectFit: "cover", overflow: "visible" }}
      />

      <div className="fixed items-center justify-center w-full h-1 z-200 left-0 -bottom-10  text-center text-white pointer-events-auto">
        Connect with us:
        <span className="text-blue-500">
          {" "}
          <a href="https://discord.gg/yGuUY8ZsFr" target="_blank" rel="noreferrer">
            Discord
          </a>
        </span>
        <span className="text-blue-500">
          {" "}
          <a href="https://t.me/+N_-pUunbjHw3Y2Vh" target="_blank" rel="noreferrer">
            Telegram
          </a>
        </span>
        <span className="text-blue-500">
          {" "}
          <a href="https://twitter.com/MMoriOnChain" target="_blank" rel="noreferrer">
            Twitter
          </a>
        </span>
        <span className="text-blue-500">
          {" "}
          <a href="https://github.com/Ataxia123/MementoMori" target="_blank" rel="noreferrer">
            Github
          </a>
        </span>
        Made with {"<3"} by At0x.eth and the NERDS
        <br />
      </div>

      <div className=" pointer-events-none fixed overflow-hidden rounded-full fixed h-2/3 w-1/3 top-1/4 -mt-40 right-1/3 scale-125 shadow-xl shadow-black">
        <Image src="/mmoriflame.gif" alt="Logo" fill className="  brightness-50 opacity-25" />
      </div>
    </div>
  );
};
