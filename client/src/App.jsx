import React from "react";
import { BrowserRouter as Router, Routes,Route, Navigate, BrowserRouter } from "react-router-dom";
import { AppProvider, useAppContext } from "./context/App.Context";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";

// const PlaceholderPage = ({title}) => (
//   <div className="flex items-center justify-center h-screen bg-gray-100">
//     <h1 className="text-3xl font-bold text-gray-800">{title} Page</h1>
//   </div>
// );
// dummy dashboard page
const Dashboard = () => <div className="text-2xl font-bold">Welcome to Dashboard</div>

const ProtectedRoute = ({children}) => {
  const {user, loading} = useAppContext();

  if(loading) return <div>Loading.....</div>

  if(!user) {
    return <Navigate to="/login" replace />;
  }
  return children; // agar login hai to andar aane do
}

function App() {
  return(
    // <Router>

    <AppProvider>
      <BrowserRouter>
    
      <Routes>

        {/* login routes : isme layout nahi cghahiye */}

        <Route path="/login" element= {<LoginPage/>}/>

        {/* Secures Routes : Isme Guard lagaya hai aur layout lagaya hai */}

        <Route
        path="/"
        element= {
          <ProtectedRoute>
            <Layout/>
          </ProtectedRoute>
        }
        >
        {/* ye routes outlet ki jagah render honge */}

      {/* <Route path="/" element={<PlaceholderPage title = "login"/>} />
      <Route path="/dashboard" element={<PlaceholderPage title = "dashboard"/>}/>
      <Route path="/properties" element = {<PlaceholderPage title = "properties"/>}/>
      <Route path="/tenants" element = {<PlaceholderPage title = "tenants"/>}/> */}

      <Route index element = {<Navigate to="/dashboard" replace />}/>
      <Route path="dashboard" element = {<Dashboard/>}/>
      <Route path="properties" element = {<div>Properties Page</div>}/>
      <Route path="tenants" element = {<div>Tenants Page</div>}/>
      <Route path="payments" element = {<div>Payments Page</div>}/>
      <Route path="leases" element = {<div>Leases Page</div>}/>
      <Route path="maintenance" element = {<div>Maintenance Page</div>}/>
      <Route path="profile" element = {<div>Profile Page</div>}/>
      </Route>
      </Routes>
    // 
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;