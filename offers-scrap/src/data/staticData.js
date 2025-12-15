const getCurrentDateFolder = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; 
};

const loadTodayData = async (storeName) => {
  const dateFolder = getCurrentDateFolder();
  try {
    const data = await import(`../../../scraper/data/daily/${dateFolder}/${storeName}-ofertas.json`);
    return data.default || data;
  } catch {
    return null;
  }
};

const convertToExpectedFormat = (fileData) => {
  if (!fileData) return {};
  
  const data = fileData?.data || fileData;
  
  if (!data || !Array.isArray(data)) return {};
  
  const formattedProducts = {};
  
  data.forEach((product, index) => {
    formattedProducts[index.toString()] = product;
  });
  
  formattedProducts._metadata = {
    source: 'static',
    date: fileData?.date || new Date().toISOString().split('T')[0],
    lastUpdate: fileData?.lastUpdate || new Date().toISOString(),
    totalProducts: data.length
  };
  
  return formattedProducts;
};

export const getStaticOffersData = async () => {
  const stores = ['dia', 'jumbo', 'carrefour', 'coto', 'farmacity', 'farma'];
  const data = {};
  
  for (const store of stores) {
    const storeData = await loadTodayData(store);
    data[store] = convertToExpectedFormat(storeData);
  }
  
  return data;
};

export const getStaticStats = async () => {
  const staticData = await getStaticOffersData();
  const stats = {};
  
  Object.entries(staticData).forEach(([store, data]) => {
    if (data._metadata) {
      stats[store] = {
        hasData: true,
        totalProducts: data._metadata.totalProducts,
        lastUpdate: data._metadata.lastUpdate
      };
    } else {
      stats[store] = {
        hasData: false,
        totalProducts: 0,
        lastUpdate: null
      };
    }
  });
  
  return stats;
};

export const staticOffersData = {
  dia: {},
  jumbo: {},
  carrefour: {},
  coto: {},
  farmacity: {},
  farma: {}
};

export default staticOffersData;
