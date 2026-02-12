import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        try {
            // UPDATE PORT IF NEEDED
            const response = await axios.post("https://localhost:7178/api/Auth/login", {
                username, password
            });
            localStorage.setItem("token", response.data);
            navigate("/dashboard");
        } catch (err) {
            setError("Invalid username or password");
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 transform transition-all hover:scale-105">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Welcome Back</h2>

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Username</label>
                    <input 
                        type="text" 
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Enter your username"
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                    />
                </div>

                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                    <input 
                        type="password" 
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="••••••••"
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                </div>

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold py-2 rounded-lg hover:opacity-90 transition duration-300"
                >
                    Login
                </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <span 
                    onClick={() => navigate("/register")} 
                    className="text-purple-600 font-bold cursor-pointer hover:underline"
                >
                    Sign up
                </span>
            </p>
        </div>
    );
}

export default Login;