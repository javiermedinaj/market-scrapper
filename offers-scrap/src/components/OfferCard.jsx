import PropTypes from 'prop-types';
import { ExternalLink, Store, ShoppingCart } from 'lucide-react';

const OfferCard = ({ product, storeName }) => {
    const formatPrice = (price) => {
        if (!price) return 'Consultar precio';
        const cleanPrice = price.toString().replace(/[^\d.,\s$]/g, '').trim();
        if (cleanPrice.includes('$')) return cleanPrice;
        if (cleanPrice) return `$${cleanPrice}`;
        return price;
    };

    const getStoreColor = (store) => {
        const colors = {
            'Jumbo': 'bg-green-100 text-green-900 dark:bg-green-900/30 text-green-800 dark:text-black border-green-200 dark:border-green-800',
            'Carrefour': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-black border-green-200 dark:border-green-800',
            'Farmacity': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-black border-purple-200 dark:border-purple-800',
            'Día': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-black border-red-200 dark:border-red-800',
            'Farma': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-black border-orange-200 dark:border-orange-800',
            'Coto': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-black border-yellow-200 dark:border-yellow-800'
        };
        return colors[store] || 'bg-zinc-400 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    };

    const handleProductClick = () => {
        if (finalLink && finalLink !== '#') {
            window.open(finalLink, '_blank', 'noopener,noreferrer');
        }
    };

    const productName = product.name || (product.image ? 'Oferta especial' : 'Producto sin nombre');
    const productImage = product.image && product.image !== 'Imagen no encontrada' ? product.image : null;
    const hasValidLink = product.link && product.link !== 'https://';

    const defaultStoreLinks = {
        'Coto': 'https://www.coto.com.ar/ofertas',
        'Carrefour': 'https://www.carrefour.com.ar/promociones',
        'Jumbo': 'https://www.jumbo.com.ar/ofertas',
        'Día': 'https://diaonline.supermercadosdia.com.ar/especial-ofertas',
        'Farmacity': 'https://www.farmacity.com/promociones',
        'Farma': 'https://www.farma.com.ar/ofertas'
    };

    const finalLink = hasValidLink ? product.link : defaultStoreLinks[storeName] || '#';

    return (
        <div className="offer-card group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all">
            <div className="relative bg-white aspect-[4/3] overflow-hidden flex-shrink-0">
                {productImage ? (
                    <img
                        src={productImage}
                        alt={productName}
                        className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                            }
                        }}
                    />
                ) : null}
                <div className={`${productImage ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-zinc-800`}>
                    <div className="text-center">
                        <ShoppingCart className="w-10 h-10 text-zinc-500 mx-auto mb-2" />
                        <span className="text-sm text-zinc-400">Sin imagen</span>
                    </div>
                </div>

                {storeName && (
                    <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStoreColor(storeName)}`}>
                            <Store className="w-3 h-3 mr-1" />
                            {storeName}
                        </span>
                    </div>
                )}
            </div>
            <div className="p-4">
                <div className="h-12 mb-3 flex items-start">
                    <h3 className="font-semibold text-white text-sm line-clamp-2">
                        {productName}
                    </h3>
                </div>
                <div className="h-8 flex items-center gap-2 mb-4">
                    <span className="text-xl font-bold text-green-400 truncate">
                        {formatPrice(product.price)}
                    </span>
                </div>
                <button
                    onClick={handleProductClick}
                    disabled={!finalLink || finalLink === '#'}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                        finalLink && finalLink !== '#'
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                    }`}
                >
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                        {finalLink && finalLink !== '#' ? 'Ver oferta' : 'No disponible'}
                    </span>
                </button>
            </div>
        </div>
    );
};

OfferCard.propTypes = {
    product: PropTypes.shape({
        name: PropTypes.string,
        image: PropTypes.string,
        link: PropTypes.string,
        price: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    }),
    storeName: PropTypes.string
};

export default OfferCard;
