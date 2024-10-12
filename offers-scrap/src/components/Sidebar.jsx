import React from 'react';

const Sidebar = ({ stores, activeStore, onStoreSelect }) => {
  return (
    <div className="bg-white w-full md:w-64 p-4">
      <h2 className="text-xl font-bold mb-4">Mercados</h2>
      <ul>
        {stores.map((store) => (
          <li key={store}>
            <button 
              className={`block w-full text-left p-2 rounded ${activeStore === store ? 'bg-black text-white' : 'bg-gray-200'}`}
              onClick={() => onStoreSelect(store)}
            >
              {store.charAt(0).toUpperCase() + store.slice(1)}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;