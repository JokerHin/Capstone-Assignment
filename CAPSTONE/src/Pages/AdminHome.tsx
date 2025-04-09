import { useNavigate } from "react-router-dom";

export default function AdminHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-800 to-black text-white">
      <header className="w-full p-5 bg-gray-900 shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold text-orange-500">Admin Dashboard</h1>
        <button
          onClick={() => navigate("/")}
          className="bg-orange-500 px-4 py-2 rounded text-white hover:bg-orange-600"
        >
          Logout
        </button>
      </header>
      <main className="flex flex-col items-center mt-10">
        <h2 className="text-3xl font-semibold mb-5">Welcome, Admin!</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-11/12 max-w-4xl">
          <div className="p-5 bg-gray-700 rounded shadow-md text-center">
            <h3 className="text-xl font-bold mb-3">Manage Users</h3>
            <p>View, edit, or delete user accounts.</p>
          </div>
          <div className="p-5 bg-gray-700 rounded shadow-md text-center">
            <h3 className="text-xl font-bold mb-3">View Reports</h3>
            <p>Access system reports and analytics.</p>
          </div>
          <div className="p-5 bg-gray-700 rounded shadow-md text-center">
            <h3 className="text-xl font-bold mb-3">Settings</h3>
            <p>Configure system settings and preferences.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
