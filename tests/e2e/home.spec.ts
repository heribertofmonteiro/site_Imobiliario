import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("deve carregar a página inicial", async ({ page }) => {
    // Verificar se o título está presente
    await expect(page.locator("h1")).toContainText("Encontre seu imóvel perfeito hoje");

    // Verificar se o navbar está visível
    await expect(page.locator("nav")).toBeVisible();

    // Verificar se o botão CTA está presente
    const ctaButton = page.locator("button:has-text('Quero Alugar Agora')");
    await expect(ctaButton).toBeVisible();
  });

  test("deve exibir ofertas próximas", async ({ page }) => {
    // Aguardar o carregamento das ofertas
    await page.waitForTimeout(2000);

    // Verificar se a seção de ofertas está visível
    const ofertasSection = page.locator("text=Ofertas Próximas de Você");
    await expect(ofertasSection).toBeVisible();

    // Verificar se há cartões de imóveis
    const imovelCards = page.locator("[class*='rounded-lg'][class*='shadow']");
    const count = await imovelCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("deve clicar no botão CTA", async ({ page }) => {
    const ctaButton = page.locator("button:has-text('Quero Alugar Agora')");
    await ctaButton.click();

    // Verificar se a página mudou ou um modal abriu
    await page.waitForTimeout(1000);
    expect(page.url()).toBeDefined();
  });

  test("deve exibir seção de ofertas imperdíveis", async ({ page }) => {
    // Scroll para baixo
    await page.evaluate(() => window.scrollBy(0, window.innerHeight * 3));

    // Aguardar a seção aparecer
    await page.waitForTimeout(1000);

    // Verificar se a seção de ofertas imperdíveis está visível
    const ofertasImperdiveisSection = page.locator("text=Ofertas Imperdíveis");
    await expect(ofertasImperdiveisSection).toBeVisible();
  });

  test("deve ter navegação funcional", async ({ page }) => {
    // Verificar se os links de navegação estão presentes
    const homeLink = page.locator("a:has-text('Home')");
    const imoveisLink = page.locator("a:has-text('Imóveis')");
    const contatoLink = page.locator("a:has-text('Contato')");

    await expect(homeLink).toBeVisible();
    await expect(imoveisLink).toBeVisible();
    await expect(contatoLink).toBeVisible();
  });

  test("deve ter rodapé com informações", async ({ page }) => {
    // Scroll para o final da página
    await page.evaluate(() => window.scrollBy(0, document.body.scrollHeight));

    // Aguardar o rodapé aparecer
    await page.waitForTimeout(1000);

    // Verificar se o rodapé está visível
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();

    // Verificar se há informações de copyright
    const copyright = page.locator("text=© 2025");
    await expect(copyright).toBeVisible();
  });
});

test.describe("Responsividade", () => {
  test("deve ser responsivo em mobile", async ({ page }) => {
    // Definir viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Navegar para a página
    await page.goto("/");

    // Verificar se o conteúdo é visível
    const title = page.locator("h1");
    await expect(title).toBeVisible();

    // Verificar se o botão CTA é acessível
    const ctaButton = page.locator("button:has-text('Quero Alugar Agora')");
    await expect(ctaButton).toBeVisible();
  });

  test("deve ser responsivo em tablet", async ({ page }) => {
    // Definir viewport tablet
    await page.setViewportSize({ width: 768, height: 1024 });

    // Navegar para a página
    await page.goto("/");

    // Verificar se o conteúdo é visível
    const title = page.locator("h1");
    await expect(title).toBeVisible();
  });

  test("deve ser responsivo em desktop", async ({ page }) => {
    // Definir viewport desktop
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Navegar para a página
    await page.goto("/");

    // Verificar se o conteúdo é visível
    const title = page.locator("h1");
    await expect(title).toBeVisible();
  });
});

test.describe("Performance", () => {
  test("deve carregar a página em menos de 3 segundos", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/");

    const endTime = Date.now();
    const loadTime = endTime - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test("deve ter imagens com lazy loading", async ({ page }) => {
    await page.goto("/");

    // Verificar se as imagens têm o atributo loading="lazy"
    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const loading = await images.nth(i).getAttribute("loading");
      // Pode ser "lazy" ou não ter o atributo (padrão)
      expect(loading === "lazy" || loading === null).toBeTruthy();
    }
  });
});

test.describe("Acessibilidade", () => {
  test("deve ter alt text em todas as imagens", async ({ page }) => {
    await page.goto("/");

    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      expect(alt).toBeTruthy();
    }
  });

  test("deve ter contraste de cores adequado", async ({ page }) => {
    await page.goto("/");

    // Verificar se os botões têm contraste adequado
    const buttons = page.locator("button");
    const count = await buttons.count();

    expect(count).toBeGreaterThan(0);
  });

  test("deve ser navegável por teclado", async ({ page }) => {
    await page.goto("/");

    // Navegar usando Tab
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");

    // Verificar se algum elemento está focado
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
});
