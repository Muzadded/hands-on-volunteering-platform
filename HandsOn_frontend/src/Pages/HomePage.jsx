import React from 'react';
import NavBar from './components/NavBar';
import HomeBody from './components/HomeBody';
import Footer from './components/Footer';

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow">
        <HomeBody />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;