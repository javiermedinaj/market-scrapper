import React from 'react'
import ProductList from './components/ProductList'

function App() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Productos de Jumbo</h1>
      <ProductList />
    </div>
  )
}

export default App