import assert from "node:assert/strict";
import { test } from "node:test";
import { costOf, isPantry, parseSaleFormat } from "../src/domain/cost";
import { isAllowed, parseDiet } from "../src/domain/diet";

test("parseSaleFormat: por kg", () => {
  assert.equal(parseSaleFormat("Banana Ecuador X Kg").kind, "per_kg");
  assert.equal(parseSaleFormat("Cebolla Blanca Por Kg").kind, "per_kg");
  assert.equal(parseSaleFormat("Papa Cepillada x Kg").kind, "per_kg");
});

test("parseSaleFormat: paquete (no confundir 1 Kg. con por kg)", () => {
  const azucar = parseSaleFormat("Azúcar Plus DIA Común tipo A 1 Kg.");
  assert.equal(azucar.kind, "package");
  if (azucar.kind === "package") {
    assert.equal(azucar.amount, 1);
    assert.equal(azucar.unit, "kg");
  }

  const fideos = parseSaleFormat("Fideos Tirabuzón Favorita 500 Gr.");
  assert.equal(fideos.kind, "package");
  if (fideos.kind === "package") {
    assert.equal(fideos.amount, 500);
    assert.equal(fideos.unit, "gr");
  }

  assert.equal(parseSaleFormat("Leche Uat La Serenisima 1 - 1 Lt").kind, "package");
});

test("parseSaleFormat: por unidad (con pack size)", () => {
  const palta = parseSaleFormat("Palta X 1 Ud.");
  assert.equal(palta.kind, "per_unit");
  const ajo = parseSaleFormat("Ajo X 2 Ud.");
  assert.equal(ajo.kind, "per_unit");
  if (ajo.kind === "per_unit") assert.equal(ajo.packSize, 2);
  assert.equal(parseSaleFormat("Palta Hass Elegida X Un").kind, "per_unit");
});

test("parseSaleFormat: desconocido", () => {
  assert.equal(parseSaleFormat("Producto raro sin tamaño").kind, "unknown");
});

test("isPantry: palabras completas, no substrings", () => {
  assert.equal(isPantry("Sal Fina DIA 500 Gr."), true);
  assert.equal(isPantry("Aceite de Girasol Dia 900 Ml."), true);
  assert.equal(isPantry("Salchicha Parillera"), false);
  assert.equal(isPantry("Salsa de Tomate"), false);
});

test("costOf: por kg usa la cantidad", () => {
  const conKg = costOf(0.5, "kg", "Banana Ecuador X Kg", 2899);
  assert.equal(conKg.cost, 1450);
  const conGramos = costOf(500, "g", "Banana Ecuador X Kg", 2899);
  assert.equal(conGramos.cost, 1450);
});

test("costOf: paquete calcula paquetes necesarios", () => {
  const uno = costOf(250, "g", "Fideos Tirabuzón Favorita 500 Gr.", 1060);
  assert.equal(uno.cost, 1060);

  const dos = costOf(1000, "g", "Fideos Tirabuzón Favorita 500 Gr.", 1060);
  assert.equal(dos.cost, 2120);
  assert.equal(dos.packages, 2);
});

test("costOf: por unidad multiplica unidades", () => {
  const una = costOf(1, "unidad", "Palta X 1 Ud.", 849);
  assert.equal(una.cost, 849);
  const dos = costOf(2, "unidad", "Palta X 1 Ud.", 849);
  assert.equal(dos.cost, 1698);
});

test("costOf: pack de N unidades no multiplica de más", () => {
  assert.equal(costOf(2, "unidad", "Ajo X 2 Ud.", 2290).cost, 2290);
  assert.equal(costOf(1, "unidad", "Ajo X 2 Ud.", 2290).cost, 2290);
  assert.equal(costOf(3, "unidad", "Ajo X 2 Ud.", 2290).cost, 4580);
});

test("costOf: despensa no suma", () => {
  const sal = costOf(1, "cucharadita", "Sal Fina DIA 500 Gr.", 990);
  assert.equal(sal.pantry, true);
  assert.equal(sal.cost, 0);
});

test("diet: vegetariana", () => {
  assert.equal(isAllowed({ name: "Milanesa de Soja Lucchetti" }, "vegetarian"), true);
  assert.equal(isAllowed({ name: "Pollo Fresco x Kg" }, "vegetarian"), false);
  assert.equal(isAllowed({ name: "Carne Picada" }, "vegetarian"), false);
  assert.equal(isAllowed({ name: "Atún al Natural" }, "vegetarian"), false);
  assert.equal(isAllowed({ name: "Jamón Cocido" }, "vegetarian"), false);
  assert.equal(isAllowed({ name: "Queso Mozzarella" }, "vegetarian"), true);
  assert.equal(
    isAllowed({ name: "Producto X", category: "Carnes" }, "vegetarian"),
    false,
  );
});

test("diet: vegana", () => {
  assert.equal(isAllowed({ name: "Queso Mozzarella" }, "vegan"), false);
  assert.equal(isAllowed({ name: "Leche Entera" }, "vegan"), false);
  assert.equal(isAllowed({ name: "Huevo Color" }, "vegan"), false);
  assert.equal(isAllowed({ name: "Leche de Almendras" }, "vegan"), true);
  assert.equal(isAllowed({ name: "Tofu Firme" }, "vegan"), true);
  assert.equal(isAllowed({ name: "Sal Fina" }, "vegan"), true);
  assert.equal(
    isAllowed({ name: "Producto X", category: "Lácteos" }, "vegan"),
    false,
  );
});

test("parseDiet", () => {
  assert.equal(parseDiet("vegano"), "vegan");
  assert.equal(parseDiet("vegetariana"), "vegetarian");
  assert.equal(parseDiet("veg"), "vegetarian");
  assert.equal(parseDiet("omnivore"), "omnivore");
  assert.equal(parseDiet(""), "omnivore");
});
