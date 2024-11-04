import { useTheme } from '../context/ThemeContext';

const OfferCard = ({ offer }) => {
  const { darkMode } = useTheme();
  
  return (
    <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} shadow-lg rounded-lg overflow-hidden m-4 transition-all duration-300 transform hover:scale-105 hover:shadow-xl`}>
      <img 
        src={offer.image} 
        alt={offer.name} 
        className="w-full h-48 object-cover" 
      />
      <div className="p-4">
        <h3 className="text-lg font-bold truncate">{offer.name}</h3>
        <p className="text-2xl font-bold mt-2">{offer.price}</p>
        <button className={`mt-4 ${darkMode ? 'bg-gray-700' : 'bg-black'} text-white py-3 px-6 rounded-full w-full transition-all duration-300 hover:scale-105 hover:opacity-90 shadow-md`}>
  <a href={offer.link} target="_blank" rel="noopener noreferrer" className="inline-block w-full">
    Ver oferta
  </a>
</button>
      </div>
    </div>
  );
};

export default OfferCard;