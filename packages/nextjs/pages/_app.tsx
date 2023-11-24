import { useEffect, useState } from "react";
import type { AppProps } from "next/app";
import Image from "next/image";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import NextNProgress from "nextjs-progressbar";
import { Toaster } from "react-hot-toast";
import { useDarkMode } from "usehooks-ts";
import { WagmiConfig } from "wagmi";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { BlockieAvatar } from "~~/components/scaffold-eth";
import { useNativeCurrencyPrice } from "~~/hooks/scaffold-eth";
import { useGlobalState } from "~~/services/store/store";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";
import { appChains } from "~~/services/web3/wagmiConnectors";
import "~~/styles/globals.css";

const ScaffoldEthApp = ({ Component, pageProps }: AppProps) => {
  const url = process.env.NEXT_PUBLIC_WEBSITE || "http://localhost:3000";

  const price = useNativeCurrencyPrice();
  const setDatabase = useGlobalState(state => state.setDatabase);
  const setNativeCurrencyPrice = useGlobalState(state => state.setNativeCurrencyPrice);
  const fetchDb = async () => {
    try {
      const response = await fetch(url + "/api/database"); // assume the same host
      const data = await response.json();
      console.log(data, "Player data from DB");
      setDatabase(data);
    } catch (e: any) {
      console.log(e.message);
    }
  };

  // This variable is required for initial client side rendering of correct theme for RainbowKit
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    if (price > 0) {
      setNativeCurrencyPrice(price);
    }
  }, [setNativeCurrencyPrice, price]);

  useEffect(() => {
    setIsDarkTheme(isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    fetchDb();
  }, []);

  return (
    <WagmiConfig config={wagmiConfig}>
      <NextNProgress />
      <RainbowKitProvider
        chains={appChains.chains}
        avatar={BlockieAvatar}
        theme={isDarkTheme ? darkTheme() : lightTheme()}
      >
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="relative flex flex-col flex-1 overflow-hidden">
            <Component {...pageProps} />
          </main>
          <Footer />
        </div>
        <Toaster />
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

export default ScaffoldEthApp;
