import { useState } from "react";
import PropTypes from "prop-types";

export default function Searcher() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const INITIAL_RESULTS = 2;

  const [visibleDia, setVisibleDia] = useState(INITIAL_RESULTS);
  const [visibleJumbo, setVisibleJumbo] = useState(INITIAL_RESULTS);
  const [visibleFarmacity, setVisibleFarmacity] = useState(INITIAL_RESULTS);
  const [visibleFarmaOnline, setVisibleFarmaOnline] = useState(INITIAL_RESULTS);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    setVisibleDia(INITIAL_RESULTS);
    setVisibleJumbo(INITIAL_RESULTS);
    setVisibleFarmacity(INITIAL_RESULTS);
    setVisibleFarmaOnline(INITIAL_RESULTS);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResults([]);
    setHasSearched(false);
    setVisibleDia(INITIAL_RESULTS);
    setVisibleJumbo(INITIAL_RESULTS);
    setVisibleFarmacity(INITIAL_RESULTS);
    setVisibleFarmaOnline(INITIAL_RESULTS);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
      const url = `${apiUrl}/search?q=${encodeURIComponent(query)}`;
      
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
      const products = Array.isArray(data) ? data : (data?.data || []);
      
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

  const diaResults = Array.isArray(results) ? results.filter((p) => p.store === "Día") : [];
  const jumboResults = Array.isArray(results) ? results.filter((p) => p.store === "Jumbo") : [];
  const farmacityResults = Array.isArray(results) ? results.filter((p) => p.store === "Farmacity") : [];
  const farmaOnlineResults = Array.isArray(results) ? results.filter((p) => p.store === "FarmaOnline") : [];

  const displayedDia = diaResults.slice(0, visibleDia);
  const displayedJumbo = jumboResults.slice(0, visibleJumbo);
  const displayedFarmacity = farmacityResults.slice(0, visibleFarmacity);
  const displayedFarmaOnline = farmaOnlineResults.slice(0, visibleFarmaOnline);

  const ProductCard = ({ product, storeColor, storeBgColor, storeName }) => (
    <div className="flex items-center gap-4 bg-zinc-800 border border-zinc-700 rounded-lg p-4 mb-3 hover:border-zinc-600 transition">
      <img
        src={product.image}
        alt={product.name}
        className="w-20 h-20 object-contain rounded-md bg-white border border-zinc-700"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs px-2 py-0.5 rounded font-semibold uppercase tracking-wide ${storeBgColor} ${storeColor}`}>
            {storeName}
          </span>
          <span className="text-green-400 font-bold text-lg">
            ${product.price}
          </span>
        </div>
        <div className="font-medium text-gray-100 truncate" title={product.name}>
          {product.name}
        </div>
        {product.link && (
          <a
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 text-sm underline hover:text-blue-300 mt-1 inline-block"
          >
            Ver producto
          </a>
        )}
      </div>
    </div>
  );

  ProductCard.propTypes = {
    product: PropTypes.shape({
      image: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      link: PropTypes.string,
    }).isRequired,
    storeColor: PropTypes.string.isRequired,
    storeBgColor: PropTypes.string.isRequired,
    storeName: PropTypes.string.isRequired,
  };



  const LoadMoreButton = ({ onClick, remaining }) => (
    <button
      onClick={onClick}
      className="w-full py-2 text-sm text-blue-400 hover:text-blue-300 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition"
    >
      Cargar más ({remaining} restantes)
    </button>
  );

  LoadMoreButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    remaining: PropTypes.number.isRequired,
  };

  const EmptyState = ({ storeName, hasSearched, loading }) => {
    if (!hasSearched && !loading) {
      return (
        <div className="text-gray-500 py-8 text-center flex-grow">
          <div className="text-4xl mb-2">🛒</div>
          <div>Busca productos para comparar precios</div>
        </div>
      );
    }
    if (hasSearched && !loading) {
      return (
        <div className="text-center py-8 flex-grow">
          <div className="text-gray-400 font-medium">
            Producto no encontrado en {storeName}
          </div>
          <div className="text-gray-500 text-sm mt-1">
            Intenta con otros términos de búsqueda
          </div>
        </div>
      );
    }
    return null;
  };

  EmptyState.propTypes = {
    storeName: PropTypes.string.isRequired,
    hasSearched: PropTypes.bool.isRequired,
    loading: PropTypes.bool.isRequired,
  };

  return (
    <div className="min-h-10 bg-black text-white">
      <div className="relative w-full bg-gradient-to-b from-zinc-900 to-black py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 leading-tight">
            Las mejores ofertas de Buenos Aires
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Descubrí cual es el mejor precio para tus productos
          </p>
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-red-500 placeholder-gray-500"
                placeholder="Buscar..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
              />
              <button
                onClick={handleSearch}
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 hover:bg-red-700 transition text-white px-6 py-2.5 rounded-lg font-semibold disabled:opacity-50"
              >
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>
            <div className="flex items-center justify-center gap-2 mt-4 text-gray-400 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Buenos Aires, Argentina</span>
            </div>
          </div>
        </div>
      </div>

      {(hasSearched || results.length > 0) && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Resultados de búsqueda</h2>
              <button
                onClick={clearSearch}
                className="text-gray-400 hover:text-white transition text-sm"
              >
                Limpiar búsqueda
              </button>
            </div>

            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 text-gray-200 border-b border-zinc-700 pb-2">
                Comparador de Supermercados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
                <div className="flex flex-col">
                  <h2 className="text-lg font-bold mb-2 text-red-400 flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500"></span>
                    Día
                  </h2>
                  {displayedDia.length === 0 && (
                    <EmptyState storeName="Día" hasSearched={hasSearched} loading={loading} />
                  )}
                  {displayedDia.map((p, i) => (
                    <ProductCard 
                      key={i} 
                      product={p} 
                      storeColor="text-red-300" 
                      storeBgColor="bg-red-900/50" 
                      storeName="Día" 
                    />
                  ))}
                  {diaResults.length > visibleDia && (
                    <LoadMoreButton
                      onClick={() => setVisibleDia(v => Math.min(diaResults.length, v + INITIAL_RESULTS))}
                      remaining={diaResults.length - visibleDia}
                    />
                  )}
                  {visibleDia > INITIAL_RESULTS && (
                    <button
                      onClick={() => setVisibleDia(v => Math.max(INITIAL_RESULTS, v - INITIAL_RESULTS))}
                      className="w-full py-2 text-sm text-gray-400 hover:text-white border border-zinc-700 rounded-lg hover:bg-zinc-800 transition mt-2"
                    >
                      Mostrar menos
                    </button>
                  )}
                </div>

                <div className="flex flex-col">
                  <h2 className="text-lg font-bold mb-2 text-green-400 flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-green-500"></span>
                    Jumbo
                  </h2>
                  {displayedJumbo.length === 0 && (
                    <EmptyState storeName="Jumbo" hasSearched={hasSearched} loading={loading} />
                  )}
                  {displayedJumbo.map((p, i) => (
                    <ProductCard 
                      key={i} 
                      product={p} 
                      storeColor="text-green-300" 
                      storeBgColor="bg-green-900/50" 
                      storeName="Jumbo" 
                    />
                  ))}
                  {jumboResults.length > visibleJumbo && (
                    <LoadMoreButton
                      onClick={() => setVisibleJumbo(v => Math.min(jumboResults.length, v + INITIAL_RESULTS))}
                      remaining={jumboResults.length - visibleJumbo}
                    />
                  )}
                  {visibleJumbo > INITIAL_RESULTS && (
                    <button
                      onClick={() => setVisibleJumbo(v => Math.max(INITIAL_RESULTS, v - INITIAL_RESULTS))}
                      className="w-full py-2 text-sm text-gray-400 hover:text-white border border-zinc-700 rounded-lg hover:bg-zinc-800 transition mt-2"
                    >
                      Mostrar menos
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-200 border-b border-zinc-700 pb-2">
                Comparador de Farmacias
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <h2 className="text-lg font-bold mb-2 text-purple-400 flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-purple-500"></span>
                    Farmacity
                  </h2>
                  {displayedFarmacity.length === 0 && (
                    <EmptyState storeName="Farmacity" hasSearched={hasSearched} loading={loading} />
                  )}
                  {displayedFarmacity.map((p, i) => (
                    <ProductCard 
                      key={i} 
                      product={p} 
                      storeColor="text-purple-300" 
                      storeBgColor="bg-purple-900/50" 
                      storeName="Farmacity" 
                    />
                  ))}
                  {farmacityResults.length > visibleFarmacity && (
                    <LoadMoreButton
                      onClick={() => setVisibleFarmacity(v => Math.min(farmacityResults.length, v + INITIAL_RESULTS))}
                      remaining={farmacityResults.length - visibleFarmacity}
                    />
                  )}
                  {visibleFarmacity > INITIAL_RESULTS && (
                    <button
                      onClick={() => setVisibleFarmacity(v => Math.max(INITIAL_RESULTS, v - INITIAL_RESULTS))}
                      className="w-full py-2 text-sm text-gray-400 hover:text-white border border-zinc-700 rounded-lg hover:bg-zinc-800 transition mt-2"
                    >
                      Mostrar menos
                    </button>
                  )}
                </div>
                <div className="flex flex-col">
                  <h2 className="text-lg font-bold mb-2 text-blue-400 flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full bg-blue-500"></span>
                    FarmaOnline
                  </h2>
                  {displayedFarmaOnline.length === 0 && (
                    <EmptyState storeName="FarmaOnline" hasSearched={hasSearched} loading={loading} />
                  )}
                  {displayedFarmaOnline.map((p, i) => (
                    <ProductCard 
                      key={i} 
                      product={p} 
                      storeColor="text-blue-300" 
                      storeBgColor="bg-blue-900/50" 
                      storeName="FarmaOnline" 
                    />
                  ))}
                  {farmaOnlineResults.length > visibleFarmaOnline && (
                    <LoadMoreButton
                      onClick={() => setVisibleFarmaOnline(v => Math.min(farmaOnlineResults.length, v + INITIAL_RESULTS))}
                      remaining={farmaOnlineResults.length - visibleFarmaOnline}
                    />
                  )}
                  {visibleFarmaOnline > INITIAL_RESULTS && (
                    <button
                      onClick={() => setVisibleFarmaOnline(v => Math.max(INITIAL_RESULTS, v - INITIAL_RESULTS))}
                      className="w-full py-2 text-sm text-gray-400 hover:text-white border border-zinc-700 rounded-lg hover:bg-zinc-800 transition mt-2"
                    >
                      Mostrar menos
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}