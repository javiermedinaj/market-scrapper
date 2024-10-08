import React, { useState, useEffect } from 'react';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://tu-url-de-almacenamiento.com/jumbo.json')
      .then(response => response.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching products:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Cargando productos...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map((product, index) => (
        <div key={index} className="border p-4 rounded shadow">
          <h2 className="text-lg font-bold">{product.name}</h2>
          <p className="text-gray-600">{product.price}</p>
          <a href={`https://www.jumbo.com.ar${product.link}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            Ver en Jumbo
          </a>
        </div>
      ))}
    </div>
  );
};

export default ProductList; 