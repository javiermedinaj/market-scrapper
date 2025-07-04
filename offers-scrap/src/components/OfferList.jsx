import React, { useState, useEffect } from 'react';
import OfferCard from './OfferCard';
import { Store, Loader, AlertCircle, RefreshCw, Calendar, TrendingUp, Database } from 'lucide-react';
import { staticOffersData, getStaticStats } from '../data/staticData';

const STORES = [
  { id: 'jumbo', name: 'Jumbo', color: 'bg-green-600', textColor: 'text-green-600' },
  { id: 'carrefour', name: 'Carrefour', color: 'bg-blue-600', textColor: 'text-blue-400' },
  { id: 'farmacity', name: 'Farmacity', color: 'bg-purple-600', textColor: 'text-purple-600' },
  { id: 'dia', name: 'Día', color: 'bg-red-600', textColor: 'text-red-600' },
  { id: 'farma', name: 'FarmaOnline', color: 'bg-orange-600', textColor: 'text-orange-600' },
  { id: 'coto', name: 'Coto', color: 'bg-yellow-600', textColor: 'text-yellow-600' }
];

const OfferList = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStore, setActiveStore] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [usingStaticData, setUsingStaticData] = useState(false);

  const fetchData = async () => {
    try {
      console.log('🔄 Intentando conectar al servidor...');
      const response = await fetch('http://localhost:3000/api/offers', { 
        signal: AbortSignal.timeout(5000) // Timeout de 5 segundos
      });
      
      if (!response.ok) throw new Error('Servidor no responde');
      
      const offersData = await response.json();
      setData(offersData);
      setError(null);
      setUsingStaticData(false);
      console.log('✅ Datos cargados desde el servidor');
      
    } catch (err) {
      console.log('⚠️ Servidor no disponible, usando datos estáticos');
      setData(staticOffersData);
      setError(null);
      setUsingStaticData(true);
      
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const processedData = Object.entries(data).reduce((acc, [storeId, storeData]) => {
    if (storeData && storeData._metadata) {
      const products = Object.entries(storeData)
        .filter(([key, value]) => !key.startsWith('_') && value && typeof value === 'object' && (value.name || value.image))
        .map(([key, value]) => value);

      acc[storeId] = {
        products: products,
        metadata: storeData._metadata
      };
    } else if (Array.isArray(storeData)) {
      acc[storeId] = {
        products: storeData,
        metadata: { totalProducts: storeData.length, date: new Date().toISOString().split('T')[0] }
      };
    } else if (storeData && storeData.data) {
      acc[storeId] = {
        products: Array.isArray(storeData.data) ? storeData.data : [],
        metadata: {
          totalProducts: storeData.totalProducts || storeData.data?.length || 0,
          date: storeData.date,
          lastUpdate: storeData.lastUpdate
        }
      };
    } else if (storeData && !storeData.error) {
      acc[storeId] = {
        products: [storeData],
        metadata: { totalProducts: 1, date: new Date().toISOString().split('T')[0] }
      };
    }
    return acc;
  }, {});

  const filteredProducts = activeStore === 'all' 
    ? Object.entries(processedData).flatMap(([storeId, storeInfo]) => 
        storeInfo.products.map(product => ({ ...product, storeId }))
      )
    : processedData[activeStore]?.products || [];

  const totalProducts = Object.values(processedData).reduce((sum, store) => sum + (store.products?.length || 0), 0);
  const storesWithData = Object.keys(processedData).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <Loader className="animate-spin w-12 h-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando ofertas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ofertas Disponibles</h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <TrendingUp size={16} />
                <span>{totalProducts} productos</span>
              </div>
              <div className="flex items-center gap-1">
                <Store size={16} />
                <span>{storesWithData} supermercados</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>Actualizado hoy</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 w-full md:w-auto"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-3 text-red-700 dark:text-red-400">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex overflow-x-auto gap-2 no-scrollbar py-1 px-1 -mx-1">
          <button
            onClick={() => setActiveStore('all')}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeStore === 'all'
                ? 'bg-gray-900 dark:bg-white text-white dark:text-black'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Todos ({totalProducts})
          </button>

          {STORES.map(store => {
            const storeData = processedData[store.id];
            const count = storeData?.products?.length || 0;
            const hasData = count > 0;

            return (
              <button
                key={store.id}
                onClick={() => setActiveStore(store.id)}
                disabled={!hasData}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeStore === store.id
                    ? `${store.color} text-white`
                    : hasData
                    ? `bg-gray-100 dark:bg-gray-700 ${store.textColor} hover:bg-gray-200 dark:hover:bg-gray-600`
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                {store.name} {hasData ? `(${count})` : '(0)'}
              </button>
            );
          })}
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 auto-rows-fr">
          {filteredProducts.map((product, index) => (
            <OfferCard 
              key={`${product.storeId || activeStore}-${index}`}
              product={product}
              storeName={product.storeId 
                ? STORES.find(s => s.id === product.storeId)?.name 
                : STORES.find(s => s.id === activeStore)?.name}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Store className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay ofertas disponibles</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {activeStore === 'all' 
              ? 'No se encontraron ofertas en ningún supermercado' 
              : `No hay ofertas disponibles en ${STORES.find(s => s.id === activeStore)?.name}`}
          </p>
        </div>
      )}
    </div>
  );
};

export default OfferList;
