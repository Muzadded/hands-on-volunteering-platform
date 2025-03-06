import React from 'react';
import NavBar from './components/NavBar';
import HomeBody from './components/HomeBody';

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow">
        <HomeBody />
      </main>
    </div>
  );
};

export default HomePage;