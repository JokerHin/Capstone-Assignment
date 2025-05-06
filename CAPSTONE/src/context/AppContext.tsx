import { createContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface UserData {
  id?: string;
  isAccountVerified?: boolean;
  name: string;
  email: string;
  userType?: string;
}

interface AppContextProps {
  backendUrl: string;
  isLoggedin: boolean;
  setIsLoggedin: React.Dispatch<React.SetStateAction<boolean>>;
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  getUserData: () => Promise<void>;
  login: (
    email: string,
    password: string,
    isAdmin?: boolean
  ) => Promise<boolean>;
  logout: () => void;
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

  // Login function
  const login = async (
    email: string,
    password: string,
    isAdminLogin?: boolean
  ): Promise<boolean> => {
    try {
      console.log(`Trying to login with email: ${email}`);
      console.log(`Login URL: ${backendUrl}/api/auth/login`);
      console.log(`Is admin login: ${isAdminLogin}`);

      // Axios call with correct data format and error handling
      const { data } = await axios.post(
        `${backendUrl}/api/auth/login`,
        {
          email,
          password,
          isAdminLogin: isAdminLogin || false,
        },
        {
          withCredentials: true, // Ensure cookies are properly set
        }
      );

      if (data.success) {
        setIsLoggedin(true);

        // Set a simplified userData object to avoid issues with undefined properties
        const userDataObj: UserData = {
          id: data.userData?.id,
          name: data.userData?.name || "",
          email: data.userData?.email || email,
        };

        // For admin users, include the userType
        if (isAdminLogin && data.userData) {
          userDataObj.userType = "admin";
        }

        setUserData(userDataObj);

        // Store the auth token if any is returned
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        // Store admin email in localStorage for backup auth
        if (isAdminLogin) {
          localStorage.setItem("adminEmail", email);
        }

        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error: any) {
      console.error("Login error:", error);

      // Better error message handling
      const errorMessage =
        error.response?.data?.message ||
        "Login failed. Server may be unavailable.";
      toast.error(errorMessage);
      return false;
    }
  };

  const logout = () => {
    setIsLoggedin(false);
    setUserData(null);

    localStorage.removeItem("adminEmail");
    localStorage.removeItem("token");

    axios
      .post(backendUrl + "/api/auth/logout")
      .catch((err) => console.error("Logout error:", err));
  };

  const getUserData = async () => {
    return;
  };

  return (
    <AppContent.Provider
      value={{
        backendUrl,
        isLoggedin,
        setIsLoggedin,
        userData,
        setUserData,
        getUserData,
        login,
        logout,
      }}
    >
      {children}
    </AppContent.Provider>
  );
};
