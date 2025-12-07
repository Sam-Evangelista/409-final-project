import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Login from './pages/Login';

import { BrowserRouter, Routes, Route } from 'react-router';
import reportWebVitals from './reportWebVitals';
import UserRating from './pages/UserRating';
import RatingCreator from './pages/RatingCreator';
import Profile from './pages/Profile';
import SignUp from './pages/SignUp';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<App/>}/>
      <Route path='/signup' element={<SignUp/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/user' element={<Profile/>}/>
      <Route path='/user/ratings' element={<UserRating/>}/>
      <Route path='/user/ratings/create' element={<RatingCreator/>}/>

    </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
