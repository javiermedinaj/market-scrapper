import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer} from 'recharts';
import { TrendingDown, Store, Pill, Package } from 'lucide-react';

export default function Analytics() {
  const [categoryStats, setCategoryStats] = useState([]);
  const [storesComparison, setStoresComparison] = useState({ supermarkets: {}, pharmacies: {} });
  // const [categoryStoresData, setCategoryStoresData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cheapestProducts, setCheapestProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const convertToChartData = (categories) => {
    return Object.entries(categories).map(([name, stats]) => ({
      name,
      avgPrice: stats.averagePrice,
      minPrice: stats.minPrice,
      maxPrice: stats.maxPrice,
      priceDiff: stats.maxPrice - stats.minPrice,
      cheapestStore: stats.cheapestStore
    }));
  };

  const convertStoreData = (stores) => {
    return Object.entries(stores || {}).map(([store, stats]) => ({
      name: store,
      averagePrice: stats.averagePrice
    }));
  };

  // const convertCategoryStoresData = (data) => {
  //   if (!data || Object.keys(data).length === 0) return [];
    
  //   return Object.entries(data).map(([category, stores]) => ({
  //     category,
  //     ...stores
  //   }));
  // };

  const fetchAnalytics = useCallback(async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
      
      const [categoriesRes, storesRes, availableCatsRes] = await Promise.all([
        fetch(`${apiUrl}/api/analytics/categories`),
        fetch(`${apiUrl}/api/analytics/stores-comparison`),
        fetch(`${apiUrl}/api/analytics/available-categories`)
      ]);

      const categoriesData = await categoriesRes.json();
      const storesData = await storesRes.json();
      const availableCatsData = await availableCatsRes.json();
      
      setCategoryStats(convertToChartData(categoriesData));
      setStoresComparison(storesData);
      setCategories(availableCatsData.categories || []); 
      if (availableCatsData.categories && availableCatsData.categories.length > 0) {
        setSelectedCategory(availableCatsData.categories[0]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  }, []);

  const fetchCheapestByCategory = useCallback(async (category) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';
      const res = await fetch(`${apiUrl}/api/analytics/cheapest-by-category/${encodeURIComponent(category)}`);
      const data = await res.json();
      setCheapestProducts(data.cheapest || []);
    } catch (error) {
      console.error('Error fetching cheapest products:', error);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      fetchCheapestByCategory(selectedCategory);
    }
  }, [selectedCategory, categories, fetchCheapestByCategory]);

  if (loading) return <div className="text-center py-10 text-white">Cargando analíticas...</div>;

  const supermarketStores = convertStoreData(storesComparison.supermarkets?.stores || {});
  const pharmacyStores = convertStoreData(storesComparison.pharmacies?.stores || {});

  return (
    <div className="w-full bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8">Analíticas de Ofertas</h1>
      <div className="bg-zinc-900 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Store size={24} /> Comparativa de Supermercados
        </h2>
        {supermarketStores.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={supermarketStores}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#222', border: '1px solid #666' }}
                formatter={(value) => `$${value.toFixed(2)}`}
              />
              <Bar dataKey="averagePrice" fill="#3b82f6" name="Precio Promedio" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400">Sin datos de supermercados</p>
        )}
      </div>

      <div className="bg-zinc-900 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Pill size={24} /> Comparativa de Farmacias
        </h2>
        {pharmacyStores.length > 0 ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={pharmacyStores}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#222', border: '1px solid #666' }}
                formatter={(value) => `$${value.toFixed(2)}`}
              />
              <Bar dataKey="averagePrice" fill="#8b5cf6" name="Precio Promedio" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400">Sin datos de farmacias</p>
        )}
      </div>

      <div className="bg-zinc-900 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Package size={24} /> Top 10 Productos Más Baratos por Categoría
        </h2>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">Seleccionar Categoría:</label>
          <select 
            value={selectedCategory || ''} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-64 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded text-white focus:outline-none focus:border-blue-500"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {cheapestProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-700">
                <tr>
                  <th className="text-left py-3 px-4">Producto</th>
                  <th className="text-left py-3 px-4">Marca</th>
                  <th className="text-left py-3 px-4">Tienda</th>
                  <th className="text-left py-3 px-4">Precio</th>
                  <th className="text-left py-3 px-4">Enlace</th>
                </tr>
              </thead>
              <tbody>
                {cheapestProducts.map((product, idx) => (
                  <tr key={idx} className="border-b border-zinc-800 hover:bg-zinc-800">
                    <td className="py-3 px-4 font-semibold">{product.name}</td>
                    <td className="py-3 px-4 text-gray-400">{product.brand || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs font-semibold">
                        {product.store}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-green-400 font-bold">${product.price.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <a 
                        href={product.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline text-xs"
                      >
                        Ver
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400">Selecciona una categoría para ver los productos</p>
        )}
      </div>

      <div className="bg-zinc-900 rounded-lg p-6 mt-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <TrendingDown size={24} /> Mejores Precios por Categoría
        </h2>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-sm md:text-base">
            <thead className="border-b border-zinc-700">
              <tr>
                <th className="text-left py-3 px-2 md:px-4">Categoría</th>
                <th className="text-left py-3 px-2 md:px-4">Tienda</th>
                <th className="text-right py-3 px-2 md:px-4">Mín</th>
                <th className="text-right py-3 px-2 md:px-4">Promedio</th>
                <th className="text-right py-3 px-2 md:px-4">Ahorro</th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.length > 0 ? (
                categoryStats.map((cat, i) => (
                  <tr key={i} className="border-b border-zinc-800 hover:bg-zinc-800">
                    <td className="py-3 px-2 md:px-4 font-semibold truncate">{cat.name}</td>
                    <td className="py-3 px-2 md:px-4 text-green-400 font-semibold text-xs md:text-sm">{cat.cheapestStore}</td>
                    <td className="py-3 px-2 md:px-4 text-right">${cat.minPrice.toFixed(0)}</td>
                    <td className="py-3 px-2 md:px-4 text-right">${cat.avgPrice.toFixed(0)}</td>
                    <td className="py-3 px-2 md:px-4 text-right text-yellow-400 font-semibold">
                      ${(cat.avgPrice - cat.minPrice).toFixed(0)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-3 px-4 text-center text-gray-400">
                    Sin datos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}