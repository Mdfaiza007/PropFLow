import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext} from "../context/App.Context";
import { Building2,Mail,Lock } from "lucide-react";

const LoginPage = () => {
    const {login} = useAppContext();
    const navigate = useNavigate();


// input field kya kya lena h
const [email,setEmail] = useState('');
const [password, setPassword] = useState('');

const handleSubmit = (e) => {
    e.preventDefault();

    // yaha pr hum jabtak fake dummy login karenge baad me backend add karenge
    // API call yaha par karna hai

    const dummyUser = {
        id: 1,
        name: 'Faizan Admin',
        email: email,
        role: 'owner' // yaha par tenant bhi ho skta h
    };
    login(dummyUser); // app context me user save ho jayega
    navigate('/dashboard');  // dashboard par bhej do user ko
};

return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flec items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            {/* Top Header Design */}

        <div className="bg-indigo-600 p-8 text-center">
            <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <Building2 size={32} className="text-white"/>
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome to PropFLow</h1>
            <p className="text-indigo-100 mt-2">Manage your real estate with ease</p>
        </div>

        {/* Form Area */}
        <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Email Field */}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail size={18} className="text-gray-400"/>
                        </div>
                        <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg
                        focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                        placeholder="admin@propflow.com"
                        required />
                    </div>
                </div>

                {/* Password field */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={18} className="text-gray-400"/>
                        </div>
                        <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600
                        focus:border-transparent outline-none transition-all"
                        placeholder="........"
                        required
                        />
                    </div>
                </div>

                {/* Submit button */}

                <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg
                hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
                >Sign In</button>
            </form>

            {/* Hint */}
            <div className="mt-6 text-center text-sm text-gray-500">
                Hint: You can type anything and click sign in to text
            </div>
        </div>
        </div>
    </div>
);
};

export default LoginPage;