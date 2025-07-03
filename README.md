# 🛍️ Comparador de Ofertas Supermercados

Un proyecto web que permite comparar precios y ofertas entre diferentes supermercados de forma automática y en tiempo real.

## 🚀 ¿Qué hace este proyecto?

Este proyecto automatiza la recolección de ofertas de diferentes supermercados y las presenta en una interfaz web amigable donde los usuarios pueden:
- Comparar precios entre diferentes supermercados
- Ver las ofertas más recientes
- Filtrar productos por categoría
- Encontrar los mejores descuentos

## 💻 Tecnologías Utilizadas

- **Frontend**: 
  - React con Vite.js (para una experiencia de usuario rápida y moderna)
  - TailwindCSS (para un diseño elegante y responsivo)
  
- **Backend**: 
  - Express.js (para gestionar las peticiones de datos)
  - Web Scraping automatizado
  
- **Automatización**:
  - GitHub Actions (actualización automática de datos cada 12 horas)

## 🛠️ Instalación

1. Clona el proyecto:
    ```bash
    git clone https://github.com/javiermedinaj/market-scrapper
    ```

2. Instala las dependencias:
    ```bash
    # Para el backend
    cd scraper
    npm install

    # Para el frontend
    cd ../offers-scrap
    npm install
    ```

## ⚡ Inicio Rápido

1. Inicia el backend:
    ```bash
    cd scraper
    npm start
    ```

2. Inicia el frontend:
    ```bash
    cd offers-scrap
    npm run dev
    ```

## 🔄 Características Destacadas

- Actualización automática de precios cada 12 horas
- Interfaz intuitiva y fácil de usar
- Comparación en tiempo real de precios
- Diseño responsive (se adapta a móviles y tablets)

## 🔍 Nueva Funcionalidad: Búsqueda por Input

Se ha añadido una nueva funcionalidad de búsqueda por input. Puedes utilizarla de las siguientes maneras:

1. Ejecutando el backend con Docker:
  ```bash
  cd scrapers
  npm start
  ```

2. Ejecutando el backend directamente desde la carpeta `scrapers`:
  ```bash
  cd scrapers
  node server.js
  ```

Para activar la función de búsqueda, asegúrate de habilitar el input en la barra de navegación del frontend.


