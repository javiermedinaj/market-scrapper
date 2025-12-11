import { useState } from "react";

export default function Searcher() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResults([]);
    setHasSearched(false);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
      const url = `${apiUrl}/search?q=${encodeURIComponent(query)}`;
      
      console.log('Buscando en:', url);
      
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Respuesta completa:', data);
      
      const products = Array.isArray(data) 
        ? data 
        : (data?.data || []);
      console.log('Productos encontrados:', products.length);
      
      setResults(products);
      setHasSearched(true);
    } catch (err) {
      console.error('Error completo:', err);
      setResults([]);
      setHasSearched(true);
      alert(`Error buscando productos: ${err.message}`);
    }
    setLoading(false);
  };

  const diaResults = Array.isArray(results)
    ? results.filter((p) => p.store === "Día").slice(0, 8)
    : [];
  const jumboResults = Array.isArray(results)
    ? results.filter((p) => p.store === "Jumbo").slice(0, 8)
    : [];
  const farmacityResults = Array.isArray(results)
    ? results.filter((p) => p.store === "Farmacity").slice(0, 8)
    : [];
  const farmaOnlineResults = Array.isArray(results)
    ? results.filter((p) => p.store === "FarmaOnline").slice(0, 8)
    : [];

  return (
    <div className="mb-6">
      <div className="relative w-full max-w-8xl mx-auto">
        <div className="mb-4 flex flex-col items-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full shadow-lg">
            <span className="text-sm font-medium text-white">
              Comparador de Supermercados
            </span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg">
            <div className="px-2 py-0.5 bg-yellow-400 rounded-full animate-bounce">
              <span className="text-xs font-bold text-black">¡NUEVO!</span>
            </div>
            <span className="text-sm font-medium text-white">
              Comparador de Farmacias
            </span>
          </div>
        </div>

        <div className="w-full p-4 sm:p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-md">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 mb-4">
            <input
              className="border border-gray-300 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Buscar producto..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
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
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200 border-b pb-2">
              Comparador de Supermercados
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col h-full">
                <h2 className="text-lg font-bold mb-2 text-red-600 dark:text-red-400 flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>{" "}
                  Día
                </h2>
                {diaResults.length === 0 && hasSearched && !loading && (
                  <div className="text-center py-8 flex-grow">
                    <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">😔</div>
                    <div className="text-gray-600 dark:text-gray-400 font-medium">
                      Producto no encontrado en Día
                    </div>
                    <div className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                      Intenta con otros términos de búsqueda
                    </div>
                  </div>
                )}
                {!hasSearched && !loading && (
                  <div className="text-gray-400 dark:text-gray-500 py-8 text-center flex-grow">
                    <div className="text-4xl mb-2">🛒</div>
                    <div>Busca productos para comparar precios</div>
                  </div>
                )}
                {diaResults.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-20 h-20 object-contain rounded-md bg-white border border-gray-200 dark:border-zinc-700"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded font-semibold uppercase tracking-wide bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                          Día
                        </span>
                        <span className="text-green-700 dark:text-green-400 font-bold text-lg">
                          ${p.price}
                        </span>
                      </div>
                      <div
                        className="font-medium text-gray-900 dark:text-gray-100 truncate"
                        title={p.name}
                      >
                        {p.name}
                      </div>
                      {p.link && (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 text-sm underline hover:text-blue-800 dark:hover:text-blue-200 mt-1 inline-block"
                        >
                          Ver producto
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col h-full">
                <h2 className="text-lg font-bold mb-2 text-green-700 dark:text-green-400 flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>{" "}
                  Jumbo
                </h2>
                {jumboResults.length === 0 && hasSearched && !loading && (
                  <div className="text-center py-8 flex-grow">
                    <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">😔</div>
                    <div className="text-gray-600 dark:text-gray-400 font-medium">
                      Producto no encontrado en Jumbo
                    </div>
                    <div className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                      Intenta con otros términos de búsqueda
                    </div>
                  </div>
                )}
                {!hasSearched && !loading && (
                  <div className="text-gray-400 dark:text-gray-500 py-8 text-center flex-grow">
                    <div className="text-4xl mb-2">🛒</div>
                    <div>Busca productos para comparar precios</div>
                  </div>
                )}
                {jumboResults.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-20 h-20 object-contain rounded-md bg-white border border-gray-200 dark:border-zinc-700"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded font-semibold uppercase tracking-wide bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                          Jumbo
                        </span>
                        <span className="text-green-700 dark:text-green-400 font-bold text-lg">
                          ${p.price}
                        </span>
                      </div>
                      <div
                        className="font-medium text-gray-900 dark:text-gray-100 truncate"
                        title={p.name}
                      >
                        {p.name}
                      </div>
                      {p.link && (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 text-sm underline hover:text-blue-800 dark:hover:text-blue-200 mt-1 inline-block"
                        >
                          Ver producto
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200 border-b pb-2">
              Comparador de Farmacias
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col h-full">
                <h2 className="text-lg font-bold mb-2 text-purple-600 dark:text-purple-400 flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-purple-500"></span>
                  Farmacity
                </h2>
                {farmacityResults.length === 0 && hasSearched && !loading && (
                  <div className="text-center py-8 flex-grow">
                    <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">😔</div>
                    <div className="text-gray-600 dark:text-gray-400 font-medium">
                      Producto no encontrado en Farmacity
                    </div>
                    <div className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                      Intenta con otros términos de búsqueda
                    </div>
                  </div>
                )}
                {!hasSearched && !loading && (
                  <div className="text-gray-400 dark:text-gray-500 py-8 text-center flex-grow">
                    <div className="text-4xl mb-2">🛒</div>
                    <div>Busca productos para comparar precios</div>
                  </div>
                )}
                {farmacityResults.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-20 h-20 object-contain rounded-md bg-white border border-gray-200 dark:border-zinc-700"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded font-semibold uppercase tracking-wide bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                          Farmacity
                        </span>
                        <span className="text-purple-700 dark:text-purple-400 font-bold text-lg">
                          ${p.price}
                        </span>
                      </div>
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate" title={p.name}>
                        {p.name}
                      </div>
                      {p.link && (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 text-sm underline hover:text-blue-800 dark:hover:text-blue-200 mt-1 inline-block"
                        >
                          Ver producto
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col h-full">
                <h2 className="text-lg font-bold mb-2 text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
                  FarmaOnline
                </h2>
                {farmaOnlineResults.length === 0 && hasSearched && !loading && (
                  <div className="text-center py-8 flex-grow">
                    <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">😔</div>
                    <div className="text-gray-600 dark:text-gray-400 font-medium">
                      Producto no encontrado en FarmaOnline
                    </div>
                    <div className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                      Intenta con otros términos de búsqueda
                    </div>
                  </div>
                )}
                {!hasSearched && !loading && (
                  <div className="text-gray-400 dark:text-gray-500 py-8 text-center flex-grow">
                    <div className="text-4xl mb-2">🛒</div>
                    <div>Busca productos para comparar precios</div>
                  </div>
                )}
                {farmaOnlineResults.map((p, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-20 h-20 object-contain rounded-md bg-white border border-gray-200 dark:border-zinc-700"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded font-semibold uppercase tracking-wide bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                          FarmaOnline
                        </span>
                        <span className="text-blue-700 dark:text-blue-400 font-bold text-lg">
                          ${p.price}
                        </span>
                      </div>
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate" title={p.name}>
                        {p.name}
                      </div>
                      {p.link && (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 text-sm underline hover:text-blue-800 dark:hover:text-blue-200 mt-1 inline-block"
                        >
                          Ver producto
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
