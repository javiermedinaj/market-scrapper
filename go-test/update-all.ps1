#!/usr/bin/env pwsh
# Script para actualizar todos los scrapers

Write-Host "🔄 Actualizando datos de todos los supermercados..." -ForegroundColor Cyan

$stores = @(
    @{Name="Día"; Path="dia"; File="dia_scraper.go"},
    @{Name="Jumbo"; Path="jumbo"; File="jumbo_scraper.go"},
    @{Name="Farmacity"; Path="farmacity"; File="main.go"},
    @{Name="FarmaOnline"; Path="farmaonline"; File="main.go"}
)

foreach ($store in $stores) {
    Write-Host "`n📦 Scrapeando $($store.Name)..." -ForegroundColor Yellow
    
    Push-Location $store.Path
    
    $goFile = $store.File
    if (Test-Path $goFile) {
        go run $goFile
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $($store.Name) completado" -ForegroundColor Green
        } else {
            Write-Host "❌ Error en $($store.Name)" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️  No se encontró $goFile para $($store.Name)" -ForegroundColor Magenta
    }
    
    Pop-Location
    
    # Esperar un poco entre requests para no sobrecargar
    Start-Sleep -Seconds 3
}

Write-Host "`n✨ Proceso completado!" -ForegroundColor Cyan
Write-Host "📊 Los datos actualizados están en: go-test/data/" -ForegroundColor Gray
