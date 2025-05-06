import { createContext, useState, useEffect } from "react";
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

  useEffect(() => {
    const checkExistingSession = async () => {
      const storedEmail = localStorage.getItem("userEmail");

      if (storedEmail) {
        try {
          const storedUserData = localStorage.getItem("userData");

          if (storedUserData) {
            const parsedUserData = JSON.parse(storedUserData);
            setUserData(parsedUserData);
            setIsLoggedin(true);
          } else {
            // If we have email but no userData, try to fetch it
            await getUserData();
          }
        } catch (error) {
          console.error("Error restoring session:", error);
          // Clear potentially corrupted data
          localStorage.removeItem("userData");
        }
      }
    };

    checkExistingSession();
  }, []);

  // Update localStorage whenever userData or login state changes
  useEffect(() => {
    if (isLoggedin && userData) {
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem(
        "isAdmin",
        userData.userType === "admin" ? "true" : "false"
      );
    } else if (!isLoggedin) {
      // If logged out, clean up localStorage (except userEmail which is handled in logout function)
      localStorage.removeItem("userData");
      localStorage.removeItem("isAdmin");
    }
  }, [isLoggedin, userData]);

  const getUserData = async () => {
    try {
      const email = localStorage.getItem("userEmail");
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

      if (response.data.success && response.data.userData) {
        setUserData(response.data.userData);
        setIsLoggedin(true);

        // Save to localStorage for persistence
        localStorage.setItem(
          "userData",
          JSON.stringify(response.data.userData)
        );
      }
    } catch (error) {
      console.error("Error in getUserData:", error);
    }
  };

  // Login function with better logging for getUserData
  const login = async (
    email: string,
    password: string,
    isAdminLogin?: boolean
  ): Promise<boolean> => {
    try {
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
          localStorage.setItem("isAdmin", "true");
        } else {
          localStorage.setItem("isAdmin", "false");
        }

        setUserData(userDataObj);

        localStorage.setItem("userData", JSON.stringify(userDataObj));

        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        if (isAdminLogin) {
          localStorage.setItem("adminEmail", email);
        }

        localStorage.setItem("userEmail", email);

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

    // Clear ALL user and admin related data from localStorage
    localStorage.removeItem("adminEmail");
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userData");
    localStorage.removeItem("isAdmin");

    // Clear any other authentication-related items that might be stored
    localStorage.removeItem("user");
    localStorage.removeItem("admin");
    localStorage.removeItem("auth");
    localStorage.removeItem("session");

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
