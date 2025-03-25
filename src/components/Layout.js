// src/components/Layout.js
import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-900 text-white p-4 fixed w-full z-10">
        <h1 className="text-2xl">Sistema de Gestão de Obras</h1>
      </header>
      <main className="flex-1 mt-16 p-4">
        {children}
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        © 2023 Sistema de Gestão de Obras
      </footer>
    </div>
  );
};

export default Layout;