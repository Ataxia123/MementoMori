import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export const useAuthentication = () => {
  const [user, setUser] = useState<any>(null);
  let popup: Window | null = null; // Define popup at the top level of the hook

  const login = () => {
    popup = window.open(
      "http://localhost:3000/oauth/battlenet",
      "targetWindow",
      `toolbar=no,
       location=no,
       status=no,
       menubar=no,
       scrollbars=yes,
       resizable=yes,
       width=620,
       height=700`,
    );
  };

  useEffect(() => {
    // This event listener is used to handle the message event from the popup window
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "http://localhost:3000") return;

      if (event.data) {
        setUser(event.data);
        toast.success("success");
        if (popup) popup.close();
      }
    };

    // Add event listener for message events
    window.addEventListener("message", handleMessage, false);

    // Clean up the event listener when the component is unmounted or when the user is set
    return () => {
      window.removeEventListener("message", handleMessage, false);
    };
  }, []);

  const logout = async () => {
    try {
      const response = await fetch("http://localhost:3000/oauth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setUser(null);
        toast.success("Logging out successful");
      } else {
        console.error("Failed to logout", response);
        toast.error("Failed to logout");
      }
    } catch (e) {
      console.log(e);
    }
  };

  return { user, login, logout };
};
