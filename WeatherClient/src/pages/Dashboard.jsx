import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
    const navigate = useNavigate();
    
    // States
    const [todos, setTodos] = useState([]);
    const [weather, setWeather] = useState([]);
    const [newTodo, setNewTodo] = useState("");
    const [category, setCategory] = useState("General"); // New: Category state
    const [searchTerm, setSearchTerm] = useState("");     // New: Search state
    const [loading, setLoading] = useState(true);         // New: Loading state
    const [error, setError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { navigate("/"); return; }
        
        // Load everything
        Promise.all([fetchTodos(), fetchWeather()])
            .finally(() => setLoading(false));
    }, [navigate]);

    const fetchTodos = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await axios.get("https://localhost:7178/api/ToDo", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTodos(res.data);
        } catch (err) { setError("Failed to load tasks."); }
    };

    const fetchWeather = async () => {
        const token = localStorage.getItem("token");
        try {
            const res = await axios.get("https://localhost:7178/WeatherForecast", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setWeather(res.data);
        } catch (err) { console.error("Weather failed"); }
    };

    const handleAddTodo = async (e) => {
        e.preventDefault();
        if (!newTodo) return;
        const token = localStorage.getItem("token");
        try {
            // Added category to the payload
            await axios.post("https://localhost:7178/api/ToDo", 
                { text: newTodo, isCompleted: false, username: "ignored", category: category }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setNewTodo("");
            fetchTodos();
        } catch (err) { alert("Failed to add task"); }
    };

    const handleDelete = async (id) => {
        const token = localStorage.getItem("token");
        try {
            await axios.delete(`https://localhost:7178/api/ToDo/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTodos();
        } catch (err) { alert("Failed to delete task"); }
    };

    // Filter Logic: Search through tasks
    const filteredTodos = useMemo(() => {
        return todos.filter(t => t.text.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [todos, searchTerm]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-indigo-600">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen w-full bg-gray-50 pb-10">
            {/* Navbar */}
            <nav className="bg-white shadow-sm p-4 flex justify-between items-center px-10 border-b sticky top-0 z-10">
                <h1 className="text-2xl font-bold text-indigo-600">TaskMaster Pro 🌤️</h1>
                <div className="flex items-center gap-6">
                    <span className="hidden md:block text-gray-500 italic">Frontend Developer Workspace</span>
                    <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition shadow-sm">Logout</button>
                </div>
            </nav>

            <div className="container mx-auto mt-8 p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* COLUMN 1: IMPROVED TASKS */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 h-fit">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">My Tasks</h2>
                    
                    {/* Search Bar */}
                    <div className="mb-6">
                        <input 
                            type="text" 
                            placeholder="🔍 Search your tasks..." 
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Add Task Form with Category Toggle */}
                    <form onSubmit={handleAddTodo} className="space-y-3 mb-8">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                className="flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="What needs to be done?"
                                value={newTodo} 
                                onChange={(e) => setNewTodo(e.target.value)} 
                            />
                            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-700 transition">Add</button>
                        </div>
                        <div className="flex gap-2">
                            {["General", "Work", "Wedding", "Urgent"].map((cat) => (
                                <button 
                                    key={cat}
                                    type="button"
                                    onClick={() => setCategory(cat)}
                                    className={`text-xs px-3 py-1 rounded-full border transition ${category === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200'}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </form>

                    <div className="space-y-3">
                        {filteredTodos.length === 0 ? (
                            <div className="text-center py-10 text-gray-400">No matching tasks found.</div>
                        ) : (
                            filteredTodos.map((todo) => (
                                <div key={todo.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-indigo-200 transition">
                                    <div className="flex flex-col">
                                        <span className="text-gray-800 font-medium">{todo.text}</span>
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400">{todo.category || 'General'}</span>
                                    </div>
                                    <button onClick={() => handleDelete(todo.id)} className="bg-white p-2 rounded-lg text-red-400 hover:text-red-600 shadow-sm">
                                        Delete
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* COLUMN 2: WEATHER (Enhanced UI) */}
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 h-fit">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Weather Forecast</h2>
                    <div className="grid grid-cols-1 gap-3">
                        {weather.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                <div>
                                    <p className="text-xs text-blue-500 font-bold uppercase">{new Date(item.date).toLocaleDateString(undefined, { weekday: 'long' })}</p>
                                    <p className="text-gray-700 font-semibold">{new Date(item.date).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-indigo-700">{item.temperatureC}°C</p>
                                    <p className="text-sm text-indigo-500 font-medium">{item.summary}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Dashboard;