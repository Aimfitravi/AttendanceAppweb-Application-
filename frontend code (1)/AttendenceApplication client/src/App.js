import logo from './logo.svg';
import './App.css';
import WelcomePageComponent from './component/WelcomePageComponent';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginFormComponent from './component/LoginFormComponent';
import DisplayUserData from './component/DisplayUserData';
import React, { useEffect, useState } from 'react';
import RegistrationPageComponent from './component/RegistrationPageComponent'
import LogoutComponent from './component/LogoutComponent'
import HeaderComponent from './component/HeaderComponent';
import AdminUserList from './component/AdminUserList';
import ShowAttendace from './component/ShowAtComponent';
import Footer from './component/FooterComponent';



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    localStorage.setItem('LoginStatus', true)
    setIsLoggedIn(false);  
  };

 

  useEffect(() => {
  
    if (localStorage.getItem('LoginStatus') !== null || localStorage.getItem('LoginStatus') !== undefined) {
      setIsLoggedIn(localStorage.getItem('LoginStatus'))
    }
  },[localStorage.getItem('LoginStatus')])
  return (
    <>

      <BrowserRouter>
      <HeaderComponent></HeaderComponent>
        {/* <LogoutComponent /> */}
        {/* <AdminUserList></AdminUserList> */}
        <div>
          {isLoggedIn ? (
            <div>
              <Routes>             
                <Route path="/Welcome" element={<WelcomePageComponent/>}></Route>
                <Route path="/report" element={<DisplayUserData />}></Route>
                <Route path="/admin/users" element={<AdminUserList />} />
                <Route path="/report/:userId" element={< ShowAttendace/>} />
                <Route path="/" element={<LoginFormComponent />}></Route>
                <Route path="/signup" element={<RegistrationPageComponent />}></Route>
              </Routes>
            </div>

          ) : (
            <>
              <Routes>
                <Route path="/" element={<LoginFormComponent onLogin={handleLogin} />}></Route>
                <Route path="/signup" element={<RegistrationPageComponent />}></Route>
              </Routes>

            </>
          )}

        </div>
        <Footer></Footer>
      </BrowserRouter>
    </>
  );
}

export default App;
