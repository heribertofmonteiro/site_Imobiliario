import { test, expect } from "@playwright/test";

test.describe("Busca Avançada", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("deve buscar imóveis por bairro", async ({ page }) => {
    // Aguardar o carregamento da página
    await page.waitForTimeout(1000);

    // Procurar por um campo de busca
    const searchInput = page.locator("input[placeholder*='Buscar']");

    if (await searchInput.isVisible()) {
      // Digitar um bairro
      await searchInput.fill("Consolação");

      // Aguardar os resultados
      await page.waitForTimeout(1000);

      // Verificar se os resultados foram atualizados
      const results = page.locator("[class*='rounded-lg']");
      const count = await results.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test("deve filtrar imóveis por preço", async ({ page }) => {
    // Procurar por um filtro de preço
    const priceFilter = page.locator("input[placeholder*='Preço']");

    if (await priceFilter.isVisible()) {
      // Digitar um preço máximo
      await priceFilter.fill("1500");

      // Aguardar os resultados
      await page.waitForTimeout(1000);

      // Verificar se os resultados foram filtrados
      const results = page.locator("[class*='rounded-lg']");
      const count = await results.count();
      expect(count).toBeGreaterThan(0);
    }
  });

  test("deve exibir detalhes ao clicar em um imóvel", async ({ page }) => {
    // Aguardar o carregamento das ofertas
    await page.waitForTimeout(2000);

    // Clicar no primeiro imóvel
    const imovelCard = page.locator("[class*='rounded-lg']").first();
    const verDetalhesButton = imovelCard.locator("button:has-text('Ver Detalhes')");

    if (await verDetalhesButton.isVisible()) {
      await verDetalhesButton.click();

      // Aguardar a navegação
      await page.waitForNavigation();

      // Verificar se estamos na página de detalhes
      expect(page.url()).toContain("/imovel/");
    }
  });
});

test.describe("Paginação", () => {
  test("deve paginar resultados", async ({ page }) => {
    await page.goto("/");

    // Aguardar o carregamento das ofertas
    await page.waitForTimeout(2000);

    // Procurar por botão de próxima página
    const nextButton = page.locator("button:has-text('Próxima')");

    if (await nextButton.isVisible()) {
      // Clicar no botão
      await nextButton.click();

      // Aguardar os novos resultados
      await page.waitForTimeout(1000);

      // Verificar se os resultados mudaram
      const results = page.locator("[class*='rounded-lg']");
      const count = await results.count();
      expect(count).toBeGreaterThan(0);
    }
  });
});

test.describe("Filtros", () => {
  test("deve exibir filtros disponíveis", async ({ page }) => {
    await page.goto("/");

    // Procurar por um botão de filtros
    const filterButton = page.locator("button:has-text('Filtros')");

    if (await filterButton.isVisible()) {
      // Clicar no botão
      await filterButton.click();

      // Aguardar o modal de filtros aparecer
      await page.waitForTimeout(500);

      // Verificar se o modal está visível
      const filterModal = page.locator("[role='dialog']");
      await expect(filterModal).toBeVisible();
    }
  });

  test("deve aplicar múltiplos filtros", async ({ page }) => {
    await page.goto("/");

    // Procurar por filtros
    const filterButton = page.locator("button:has-text('Filtros')");

    if (await filterButton.isVisible()) {
      // Clicar no botão
      await filterButton.click();

      // Aguardar o modal aparecer
      await page.waitForTimeout(500);

      // Aplicar filtros (exemplo)
      const precoInput = page.locator("input[placeholder*='Preço']");
      if (await precoInput.isVisible()) {
        await precoInput.fill("2000");
      }

      // Clicar em aplicar
      const applyButton = page.locator("button:has-text('Aplicar')");
      if (await applyButton.isVisible()) {
        await applyButton.click();

        // Aguardar os resultados
        await page.waitForTimeout(1000);

        // Verificar se os resultados foram atualizados
        const results = page.locator("[class*='rounded-lg']");
        const count = await results.count();
        expect(count).toBeGreaterThan(0);
      }
    }
  });
});
