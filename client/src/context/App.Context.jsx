import React, { createContext, useContext, useEffect, useState } from "react";
// CHANGE 1: Aapka saara dummyData yahan import kiya gaya hai
import { 
    propertiesData, 
    tenantsData, 
    paymentsData, 
    leasesData, 
    maintenanceData,
    dashboardStats,
    recentActivities 
} from "../data/dummyData";

const AppContext = createContext();

export const AppProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // CHANGE 2: Saare data ke liye state banaya gaya hai, taaki app me globally edit/delete ho sake
    const [properties, setProperties] = useState(propertiesData);
    const [tenants, setTenants] = useState(tenantsData);
    const [payments, setPayments] = useState(paymentsData);
    const [leases, setLeases] = useState(leasesData);
    const [maintenance, setMaintenance] = useState(maintenanceData);

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
        // CHANGE 3: Value me user ke sath baaki states (properties, tenants) bhi bheje gaye hain
        <AppContext.Provider value={{
            user, login, logout, loading,
            properties, setProperties,
            tenants, setTenants,
            payments, setPayments,
            leases, setLeases,
            maintenance, setMaintenance,
            dashboardStats, recentActivities
        }}>
            {!loading && children}
        </AppContext.Provider>
    );
};

// ye ek hum custom hook bana rahe hai taaki baaki files me data easily mil sake
export const useAppContext = () => {
    return useContext(AppContext);
}