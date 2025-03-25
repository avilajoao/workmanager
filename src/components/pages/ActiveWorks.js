// src/pages/ActiveWorks.js
import React from "react";
import Layout from "../components/Layout";

const ActiveWorks = () => {
  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card Example */}
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300">
          <h2 className="text-xl font-semibold">Obra 01</h2>
          <p className="text-muted mt-2">Descrição da obra ativa.</p>
        </div>
      </div>
    </Layout>
  );
};

export default ActiveWorks;