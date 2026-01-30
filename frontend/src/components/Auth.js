import React, { useState } from 'react';
import Login from './Login';
import SignUp from './SignUp';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  const switchToSignUp = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  return (
    <div>
      {isLogin ? (
        <Login switchToSignUp={switchToSignUp} />
      ) : (
        <SignUp switchToLogin={switchToLogin} />
      )}
    </div>
  );
};

export default Auth;



//fewrterterer