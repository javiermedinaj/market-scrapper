# Comparador de Ofertas Supermercados

Un proyecto web que permite comparar precios y ofertas entre diferentes supermercados de forma automática y en tiempo real. Se actualiza cada 24 horas para ofrecer la información más reciente.

## ¿Qué hace este proyecto?

Este proyecto automatiza la recolección de ofertas de diferentes supermercados y las presenta en una interfaz web amigable donde los usuarios pueden:
- Comparar precios entre diferentes supermercados
- Ver las ofertas más recientes
- comparar productos específicos
- Buscar productos por nombre
- Filtrar productos por categoría
- Encontrar los mejores descuentos

## Tecnologías Utilizadas

- **Frontend**: 
  - React con Vite.js (para una experiencia de usuario rápida y moderna)
  - TailwindCSS (para un diseño elegante y responsivo)
  
- **Backend Antiguo**: 
  - Express.js (para gestionar las peticiones de datos)
  - Web Scraping automatizado

-**Backend nuevo**:
  -Go y gin-gonic 

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
    cd go-test
    go mod tidy
    go mod download
    go build -o scrapers

    # Para el frontend
    cd ../offers-scrap
    npm install
    ```

    ```

## Características Destacadas

- Actualización automática de precios cada 24 horas
- Interfaz intuitiva y fácil de usar
- Comparación en tiempo real de precios
- Diseño responsive (se adapta a móviles y tablets)



