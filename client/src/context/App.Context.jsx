import React, {  createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext();

export  const AppProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // app ke load hote hi hum pta krte h ki kya localStorage me pahle se user hai

        const storedUser = localStorage.getItem('prop_user');
        if(storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    },[]);

    const login = (userData) => {
        // baad me yaha par backend API call lagana hai
        setUser(userData);
        localStorage.setItem('prop_user',JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('prop_user');
    };

    return(
        <AppContext.Provider value={{user,login,logout,loading}}>
            {!loading && children}

        </AppContext.Provider>
    );
};

// ye ek hum custom hook bana rahe hai taaki baaki files me data easily mil sake

export const useAppContext = () => {
    return useContext(AppContext);
}
