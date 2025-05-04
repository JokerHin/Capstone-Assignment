import { createContext, useState } from "react";
import axios from "axios";
import { useEffect } from "react";

interface UserData {
  isAccountVerified: boolean;
  name: string;
  email: string;
}

interface AppContextProps {
  backendUrl: string;
  isLoggedin: boolean;
  setIsLoggedin: React.Dispatch<React.SetStateAction<boolean>>;
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  getUserData: () => Promise<void>;
}

export const AppContent = createContext<AppContextProps | undefined>(undefined);

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const getUserData = async () => {
    try {
      axios.defaults.withCredentials = true;

      // Add Authorization header with token if available
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const { data } = await axios.get(backendUrl + "/api/auth/me", {
        headers,
      });

      if (data.success) {
        setUserData(data.userData);
        setIsLoggedin(true);

        // Store token in localStorage if not already there
        if (data.token && !localStorage.getItem("token")) {
          localStorage.setItem("token", data.token);
        }
      } else {
        setIsLoggedin(false);
        setUserData(null);
        localStorage.removeItem("token");
      }
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      setIsLoggedin(false);
      setUserData(null);
      localStorage.removeItem("token");
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <AppContent.Provider
      value={{
        backendUrl,
        isLoggedin,
        setIsLoggedin,
        userData,
        setUserData,
        getUserData,
      }}
    >
      {children}
    </AppContent.Provider>
  );
};
