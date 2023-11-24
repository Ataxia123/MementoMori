import React from "react";
import RespectedDisplay from "~~/components/RespectedDisplay";
import { useGlobalState } from "~~/services/store/store";

const Obituaries = () => {
  return (
    <div>
      <h1>Obituaries</h1>
      <RespectedDisplay />
    </div>
  );
};

export default Obituaries;
