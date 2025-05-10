import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

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
  shouldRedirectAdmin: boolean;
  setShouldRedirectAdmin: React.Dispatch<React.SetStateAction<boolean>>;
}

export const AppContent = createContext<AppContextProps | undefined>(undefined);

// Create a separate context provider component to handle navigation
export const AppContextNavigationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const appContext = useContext(AppContent);
  const navigate = useNavigate();

  useEffect(() => {
    // If user is logged in as admin and we should redirect to admin dashboard
    if (appContext?.shouldRedirectAdmin) {
      navigate("/AdminHome");
      // Reset the redirect flag after navigation
      appContext.setShouldRedirectAdmin(false);
    }
  }, [appContext?.shouldRedirectAdmin, navigate, appContext]);

  // Original redirect logic for when we're already on the home page
  useEffect(() => {
    if (appContext?.isLoggedin && appContext?.userData?.userType === "admin") {
      const path = window.location.pathname;
      if (path === "/" || path === "") {
        navigate("/AdminHome");
      }
    }
  }, [appContext?.isLoggedin, appContext?.userData?.userType, navigate]);

  return <>{children}</>;
};

export const AppContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [shouldRedirectAdmin, setShouldRedirectAdmin] = useState(false);

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

            if (
              parsedUserData.userType === "admin" &&
              (window.location.pathname === "/" ||
                window.location.pathname === "")
            ) {
              window.location.href = "./AdminHome";
            }
          } else {
            // If we have email but no userData, try to fetch it
            await getUserData();
          }
        } catch (error) {
          console.error("Error restoring session:", error);
          localStorage.removeItem("userData");
        }
      }
    };

    checkExistingSession();
  }, []);

  useEffect(() => {
    if (isLoggedin && userData) {
      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem(
        "isAdmin",
        userData.userType === "admin" ? "true" : "false"
      );
    } else if (!isLoggedin) {
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

        localStorage.setItem(
          "userData",
          JSON.stringify(response.data.userData)
        );
      }
    } catch (error) {
      console.error("Error in getUserData:", error);
    }
  };

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
          localStorage.setItem("isAdmin", "true");

          setUserData(userDataObj);
          localStorage.setItem("userData", JSON.stringify(userDataObj));
          localStorage.setItem("userEmail", email);

          if (data.token) {
            localStorage.setItem("token", data.token);
          }

          // Instead of using window.location.href, set a state to trigger navigation in the navigation provider
          setShouldRedirectAdmin(true);
        } else {
          localStorage.setItem("isAdmin", "false");
          setUserData(userDataObj);
          localStorage.setItem("userData", JSON.stringify(userDataObj));
          localStorage.setItem("userEmail", email);

          if (data.token) {
            localStorage.setItem("token", data.token);
          }
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
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userData");
    localStorage.removeItem("isAdmin");

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
        shouldRedirectAdmin,
        setShouldRedirectAdmin,
      }}
    >
      {children}
    </AppContent.Provider>
  );
};
