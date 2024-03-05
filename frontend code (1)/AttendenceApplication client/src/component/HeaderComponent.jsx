import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from "react-router-dom";
import './css/Headercomponent.css'

const HeaderComponent = () => {

  const userName = localStorage.getItem('userName');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
   
  function handleLogoutButton(){
      debugger
        localStorage.clear()
        setIsLoggedIn(false);
        console.log(isLoggedIn)
        navigate('/')
  
    }

    useEffect(()=>{
           setIsLoggedIn(localStorage.getItem('LoginStatus'))
    },[localStorage.getItem('LoginStatus')])


debugger
    function handleSignInButton() {
   
      navigate('/')
    }
    
  return (
    <header className="header-container">
      <div className="company-name">( Jforce )_AttendenceApp</div>
      {/* <div><p>{localStorage.getItem('userName')}</p></div> */}
      <div className="logout-button" >
      
      { isLoggedIn ? ( <div>
        <button onClick={handleLogoutButton} style={{backgroundColor:"red"}}>Logout</button> 
        </div>  ): <div>
        <button onClick={handleSignInButton} style={{backgroundColor:"red"}}>Sign In</button> 
        </div>}
        
      </div>
    </header>
  );
};

export default HeaderComponent;
