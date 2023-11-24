import React from "react";
import RespectedDisplay from "~~/components/RespectedDisplay";
import { useGlobalState } from "~~/services/store/store";

const Obituaries = () => {
  const database = useGlobalState(state => state.database);
  console.log(database);
  return (
    <div>
      <h1>Obituaries</h1>
      <RespectedDisplay />
    </div>
  );
};

export default Obituaries;
