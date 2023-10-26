import { NextPage } from "next";
import toast from "react-hot-toast";

interface Props {
  user: any;
  address: string | null;
  login: () => void;
  logout: () => void;
}

const Login: NextPage<Props> = ({ user, address, login, logout }) => {
  return (
    <div className="card mb-4 p-4">
      {!user ? <button onClick={login}>LOGIN WITH BNET</button> : <div>Logged in as {user.battletag}</div>}
      <div>Bnet User: {user?.token || "no data"}</div>
      <div>Address: {address || "no data"}</div>
      <div>User: {user ? user.battletag : "no data"}</div>
      <button
        onClick={() => {
          logout();
          toast.success("Successfully logged out");
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default Login;
