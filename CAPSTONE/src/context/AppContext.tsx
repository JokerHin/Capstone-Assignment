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

  const getUserData = async () => {
    try {
      if (!isLoggedin || !userData?.email) {
        return;
      }

      const email = userData.email;

      const token = localStorage.getItem("token");
      const headers: any = {};

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await axios.post(
        `${backendUrl}/api/user/data`,
        { email: email },
        { headers, withCredentials: true }
      );

      if (response.data?.success && response.data?.userData) {
        console.log("User data received:", response.data.userData);
        setUserData(response.data.userData);
      } else {
        console.log(
          "API request successful but no userData found:",
          response.data
        );
      }

      return response.data;
    } catch (error) {
      console.error("Error in getUserData:", error);
      return { success: false, message: "Failed to get user data" };
    }
  };

  // Login function with better logging for getUserData
  const login = async (
    email: string,
    password: string,
    isAdminLogin?: boolean
  ): Promise<boolean> => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/login`,
        {
          email,
          password,
          isAdminLogin: isAdminLogin || false,
        },
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        setIsLoggedin(true);

        const userDataObj: UserData = {
          id: data.userData?.id,
          name: data.userData?.name || "",
          email: data.userData?.email || email,
        };

        if (isAdminLogin && data.userData) {
          userDataObj.userType = "admin";
        }

        setUserData(userDataObj);

        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        if (isAdminLogin) {
          localStorage.setItem("adminEmail", email);
        }

        try {
          const userData = await getUserData();
          console.log("getUserData response after login:", userData);
        } catch (getUserError) {
          console.error(
            "Error executing getUserData after login:",
            getUserError
          );
        }

        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error: any) {
      console.error("Login error:", error);

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
