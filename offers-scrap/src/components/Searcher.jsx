import React, { useState } from "react";
import axios from "axios";

export default function Searcher() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults([]);
    try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/search`, {
    params: { q: query }
    });
      setResults(res.data);
    } catch (err) {
      setResults([]);
      alert("Error buscando productos");
    }
    setLoading(false);
  };

 //l imit para traer productos 
  const diaResults = results.filter(p => p.store === "Día").slice(0, 8);
  const jumboResults = results.filter(p => p.store === "Jumbo").slice(0, 8);

  return (
    <div className="mb-6">
        <div className="relative w-full max-w-8xl mx-auto">
          <div className="mb-4 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full shadow-lg">
              <div className="px-2 py-0.5 bg-yellow-400 rounded-full animate-bounce">
                <span className="text-xs font-bold text-black">¡NUEVO!</span>
              </div>
              <span className="text-sm font-medium text-white">Comparador de precios Jumbo/Día</span>
            </div>
          </div>
          <div className="w-full p-4 sm:p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-md">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          className="border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Buscar producto..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button 
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 transition text-white px-6 py-2 rounded-lg font-semibold shadow" 
            type="submit" 
            disabled={loading}
          >
            {loading ? "Buscando..." : "Buscar"}
          </button>
          <button
            type="button"
            className="w-full sm:w-auto bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-semibold border border-gray-300 dark:border-zinc-600 hover:bg-gray-300 dark:hover:bg-zinc-600 transition"
            onClick={clearSearch}
            disabled={loading && query === ""}
        >
          Limpiar
        </button>
        </div>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div className="flex flex-col h-full">
          <h2 className="text-lg font-bold mb-2 text-red-600 dark:text-red-400 flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span> Día
          </h2>
          {diaResults.length === 0 && !loading && (
            <div className="text-gray-500 dark:text-gray-400 py-8 flex-grow">No hay resultados</div>
          )}
          {diaResults.map((p, i) => (
            <div key={i} className="flex items-center gap-4 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition">
              <img
                src={p.image}
                alt={p.name}
                className="w-20 h-20 object-contain rounded-md bg-white border border-gray-200 dark:border-zinc-700"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded font-semibold uppercase tracking-wide bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">Día</span>
                  <span className="text-green-700 dark:text-green-400 font-bold text-lg">${p.price}</span>
                </div>
                <div className="font-medium text-gray-900 dark:text-gray-100 truncate" title={p.name}>{p.name}</div>
                {p.link && (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 text-sm underline hover:text-blue-800 dark:hover:text-blue-200 mt-1 inline-block"
                  >Ver producto</a>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col h-full">
          <h2 className="text-lg font-bold mb-2 text-green-700 dark:text-green-400 flex items-center gap-2">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span> Jumbo
          </h2>
          {jumboResults.length === 0 && !loading && (
            <div className="text-gray-500 dark:text-gray-400 py-8 flex-grow">No hay resultados</div>
          )}
          {jumboResults.map((p, i) => (
            <div key={i} className="flex items-center gap-4 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition">
              <img
                src={p.image}
                alt={p.name}
                className="w-20 h-20 object-contain rounded-md bg-white border border-gray-200 dark:border-zinc-700"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded font-semibold uppercase tracking-wide bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">Jumbo</span>
                  <span className="text-green-700 dark:text-green-400 font-bold text-lg">${p.price}</span>
                </div>
                <div className="font-medium text-gray-900 dark:text-gray-100 truncate" title={p.name}>{p.name}</div>
                {p.link && (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 text-sm underline hover:text-blue-800 dark:hover:text-blue-200 mt-1 inline-block"
                  >Ver producto</a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
    </div>
  );
}