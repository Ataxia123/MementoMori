import React, { useEffect, useState } from "react";
import CharacterList from "../components/CharacterList";
import Login from "../components/Login";
import PlayerEquipment from "../components/PlayerEquipment";
import { useAuthentication } from "../hooks/useAuthentication";
import { useDatabase } from "../hooks/useDatabase";
import { Character, EquipmentItem } from "../types/index";
import type { NextPage } from "next";
import toast from "react-hot-toast";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";

const Home: NextPage = () => {
  const { user, login, logout } = useAuthentication();
  const {
    database,
    fetchDb,
    postDb,
    fetchCharacter,
    fetchCharMedia,
    player,
    setPlayer,
    dead,
    deadIndex,
    setDeadIndex,
  } = useDatabase();

  useEffect(() => {
    fetchDb();
  }, []);

  useEffect(() => {
    if (user === null) return;
    fetchCharacter();
    toast.success("success");
  }, [user]);

  useEffect(() => {
    console.log("dead", dead, "database", database);
    toast.success("success getting characters");
  }, [database]);

  console.log("FIX ME PLEASE💀💀💀💀");

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center bg-black text-white pt-5">
        <div className="card mb-4 p-4">
          <Login user={user} login={login} logout={logout} address={null} />
        </div>

        <div className="flex justify-center items-center">
          <div className="border-2 border-white text-center max-w-xl overflow-hidden rounded-md p-8">
            <CharacterList deadCharacters={dead} setPlayer={setPlayer} settings={settings} />
          </div>
          <PlayerEquipment
            player={player}
            postDb={postDb}
            fetchCharMedia={fetchCharMedia}
            deadIndex={deadIndex}
            setDeadIndex={setDeadIndex}
          />
        </div>
      </div>
    </>
  );
};

export default Home;
