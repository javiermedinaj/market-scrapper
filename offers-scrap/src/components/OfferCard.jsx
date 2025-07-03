import { ExternalLink, Store, Tag, ShoppingCart } from 'lucide-react';

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
            'Jumbo': 'bg-green-100 text-green-800 border-green-200',
            'Carrefour': 'bg-blue-100 text-blue-800 border-blue-200',
            'Farmacity': 'bg-purple-100 text-purple-800 border-purple-200',
            'Día': 'bg-red-100 text-red-800 border-red-200',
            'Farma': 'bg-orange-100 text-orange-800 border-orange-200',
            'Coto': 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
        return colors[store] || 'bg-gray-100 text-gray-800 border-gray-200';
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
        <div className="offer-card group">
            <div className="relative bg-gray-50 aspect-[4/3] overflow-hidden flex-shrink-0">
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
                <div className={`${productImage ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200`}>
                    <div className="text-center">
                        <ShoppingCart className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-500">Sin imagen</span>
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
            <div className="offer-card-content">
                <div className="h-12 mb-3 flex items-start">
                    <h3 className="offer-title">
                        {productName}
                    </h3>
                </div>
                <div className="flex-grow min-h-4"></div>
                <div className="h-8 flex items-center gap-2 mb-4">
                    <Tag className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-lg font-bold text-green-600 truncate">
                        {formatPrice(product.price)}
                    </span>
                </div>
                <button
                    onClick={handleProductClick}
                    disabled={!finalLink || finalLink === '#'}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all h-10 flex-shrink-0 ${
                        finalLink && finalLink !== '#'
                            ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">
                        {finalLink && finalLink !== '#' ? 'Ver en tienda' : 'No disponible'}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default OfferCard;
