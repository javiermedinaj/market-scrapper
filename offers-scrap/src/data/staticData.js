import diaOffers from '../../../scraper/data/dia-ofertas.json';
import jumboOffers from '../../../scraper/data/jumbo-ofertas.json';
import carrefourOffers from '../../../scraper/data/carrefour-ofertas.json';
import cotoOffers from '../../../scraper/data/coto-ofertas.json';
import farmacityOffers from '../../../scraper/data/farmacity-ofertas.json'; 
import farmaOffers from '../../../scraper/data/farma-ofertas.json'; 

const convertToExpectedFormat = (data, storeName) => {
  if (!data || !Array.isArray(data)) return {};
  
  const formattedProducts = {};
  
  data.forEach((product, index) => {
    formattedProducts[index.toString()] = product;
  });
  
  formattedProducts._metadata = {
    source: 'static',
    date: new Date().toISOString().split('T')[0],
    lastUpdate: new Date().toISOString(),
    totalProducts: data.length
  };
  
  return formattedProducts;
};

export const staticOffersData = {
  dia: convertToExpectedFormat(diaOffers, 'dia'),
  jumbo: convertToExpectedFormat(jumboOffers, 'jumbo'),
  carrefour: convertToExpectedFormat(carrefourOffers, 'carrefour'),
  coto: convertToExpectedFormat(cotoOffers, 'coto'),
  farmacity: convertToExpectedFormat(farmacityOffers, 'farmacity'),
  farma: convertToExpectedFormat(farmaOffers, 'farma')
};

export const getStaticStats = () => {
  const stats = {};
  
  Object.entries(staticOffersData).forEach(([store, data]) => {
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

export default staticOffersData;
