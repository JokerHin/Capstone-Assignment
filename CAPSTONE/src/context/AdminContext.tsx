import React, { createContext, useState, useContext } from "react";
import { toast } from "react-toastify";
import { AppContent } from "./AppContext";

interface AdminCredentials {
  email: string;
  password: string;
}

interface AdminContextType {
  adminCredentials: AdminCredentials | null;
  setAdminCredentials: React.Dispatch<
    React.SetStateAction<AdminCredentials | null>
  >;
  showLoginForm: () => Promise<AdminCredentials | null>;
  getCredentials: () => AdminCredentials | null;
}

export const AdminContext = createContext<AdminContextType | undefined>(
  undefined
);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [adminCredentials, setAdminCredentials] =
    useState<AdminCredentials | null>(null);
  const [isLoginFormVisible, setIsLoginFormVisible] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [resolveLogin, setResolveLogin] = useState<
    ((value: AdminCredentials | null) => void) | null
  >(null);

  const appContext = useContext(AppContent);

  // Show login form and return a promise that resolves when form is submitted or dismissed
  const showLoginForm = (): Promise<AdminCredentials | null> => {
    setIsLoginFormVisible(true);

    return new Promise((resolve) => {
      setResolveLogin(() => resolve);
    });
  };

  // Handler for login form submission
  const handleLogin = () => {
    if (!adminEmail || !adminPassword) {
      toast.error("Email and password are required");
      return;
    }

    const creds = { email: adminEmail, password: adminPassword };
    setAdminCredentials(creds);
    setIsLoginFormVisible(false);

    if (resolveLogin) {
      resolveLogin(creds);
      setResolveLogin(null);
    }
  };

  // Handler for dismissing the login form
  const handleDismiss = () => {
    setIsLoginFormVisible(false);

    if (resolveLogin) {
      resolveLogin(null);
      setResolveLogin(null);
    }
  };

  // Get current credentials or show login form if not available
  const getCredentials = (): AdminCredentials | null => {
    if (adminCredentials) return adminCredentials;

    // If we have userData (context) but no password, we need to show login form
    if (appContext?.userData?.email) {
      showLoginForm();
      return null;
    }

    return null;
  };

  return (
    <AdminContext.Provider
      value={{
        adminCredentials,
        setAdminCredentials,
        showLoginForm,
        getCredentials,
      }}
    >
      {children}

      {isLoginFormVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-8 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              Admin Authentication Required
            </h2>
            <p className="text-gray-300 mb-6">
              Please enter your admin credentials to continue.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded"
                  placeholder="Admin email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-700 text-white px-3 py-2 rounded"
                  placeholder="Admin password"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={handleDismiss}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleLogin}
                className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
              >
                Log In
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminContext.Provider>
  );
};

// Custom hook to use admin context
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
