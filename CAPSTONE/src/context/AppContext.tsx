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
  axiosWithAuth: (url: string, options?: {}) => Promise<any>;
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

      // Get token from localStorage
      const token = localStorage.getItem("token");

      // Create request config with headers
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
      };

      const { data } = await axios.get(`${backendUrl}/api/auth/me`, config);

      if (data.success) {
        setUserData(data.userData);
        setIsLoggedin(true);

        // Store token in localStorage if it was returned and not already stored
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

  // Add this function to ensure all API calls include the token
  const axiosWithAuth = (
    url: string,
    options: { headers?: Record<string, string>; [key: string]: any } = {}
  ) => {
    const token = localStorage.getItem("token");
    return axios({
      url: `${backendUrl}${url}`,
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: token ? `Bearer ${token}` : "",
      },
      withCredentials: true,
    });
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
        axiosWithAuth, // Add this new function to the context
      }}
    >
      {children}
    </AppContent.Provider>
  );
};
