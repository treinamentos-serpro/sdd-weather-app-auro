import { expect, type Page, test } from '@playwright/test';

const geocodingResponse = {
  results: [
    {
      id: 3448439,
      name: 'São Paulo',
      latitude: -23.5475,
      longitude: -46.6361,
      country: 'Brasil',
      country_code: 'BR',
      admin1: 'São Paulo',
      timezone: 'America/Sao_Paulo',
    },
  ],
};

const forecastResponse = {
  timezone: 'America/Sao_Paulo',
  current: { time: '2026-09-30T12:00', temperature_2m: 22, weather_code: 1 },
  daily: {
    time: ['2026-09-30', '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'],
    weather_code: [1, 2, 3, 61, 0],
    temperature_2m_max: [25, 24, 23, 22, 26],
    temperature_2m_min: [17, 16, 15, 14, 18],
  },
};

const partialForecastResponse = {
  ...forecastResponse,
  daily: { ...forecastResponse.daily, weather_code: [] },
};

const portoGeocodingResponse = {
  results: [
    {
      ...geocodingResponse.results[0],
      id: 456,
      name: 'Porto',
      country: 'Portugal',
      country_code: 'PT',
      admin1: 'Porto',
      timezone: 'Europe/Lisbon',
    },
  ],
};

const lisboaGeocodingResponse = {
  results: [
    {
      ...geocodingResponse.results[0],
      id: 789,
      name: 'Lisboa',
      latitude: 38.72,
      longitude: -9.13,
      country: 'Portugal',
      country_code: 'PT',
      admin1: 'Lisboa',
      timezone: 'Europe/Lisbon',
    },
  ],
};

const viewports = [
  { width: 375, height: 667 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

function getSearchInput(page: Page) {
  return page.getByRole('searchbox', { name: 'Cidade', exact: true });
}

async function searchAndSelectCity(page: Page) {
  const searchInput = getSearchInput(page);
  await searchInput.fill('São Paulo');
  await searchInput.press('Enter');

  const cityResults = page.getByRole('combobox', { name: 'Resultados da busca' });
  await cityResults.focus();
  await cityResults.selectOption({ label: 'São Paulo, São Paulo, Brasil' });
  await page.getByRole('button', { name: 'Ver previsão' }).press('Enter');
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }));
  expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);
}

test('busca cidade, exibe previsão e alterna unidade nos viewports suportados', async ({
  page,
}) => {
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    await route.fulfill({ json: geocodingResponse });
  });
  await page.route('**/api.open-meteo.com/**', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    await route.fulfill({ json: forecastResponse });
  });

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    const searchInput = getSearchInput(page);
    await searchInput.fill('São Paulo');
    await searchInput.press('Enter');
    const loading = page.getByRole('status').filter({ hasText: 'Carregando' });
    await expect(loading).toBeVisible({ timeout: 100 });

    const cityResults = page.getByRole('combobox', { name: 'Resultados da busca' });
    await cityResults.focus();
    await cityResults.selectOption({ label: 'São Paulo, São Paulo, Brasil' });
    const forecastResponsePromise = page.waitForResponse((response) =>
      response.url().includes('/v1/forecast'),
    );
    await page.getByRole('button', { name: 'Ver previsão' }).press('Enter');
    await expect(loading).toBeVisible({ timeout: 100 });
    await forecastResponsePromise;
    const forecastResponseReceivedAt = Date.now();

    await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeFocused();
    await expect(page.getByRole('heading', { name: 'Próximos 5 dias' })).toBeVisible();
    await expect(page.getByRole('article')).toHaveCount(5);
    expect(Date.now() - forecastResponseReceivedAt).toBeLessThan(2_000);
    const fahrenheitButton = page.getByRole('button', { name: 'Fahrenheit' });
    await fahrenheitButton.focus();
    await fahrenheitButton.press('Enter');
    await expect(page.getByText('72°F', { exact: true })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }
});

test('combobox por teclado só consulta o clima após confirmação', async ({ page }) => {
  let forecastRequests = 0;
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({ json: geocodingResponse });
  });
  await page.route('**/api.open-meteo.com/**', async (route) => {
    forecastRequests += 1;
    await route.fulfill({ json: forecastResponse });
  });

  for (const viewport of viewports) {
    forecastRequests = 0;
    await page.setViewportSize(viewport);
    await page.goto('/');
    const searchInput = getSearchInput(page);
    await searchInput.fill('São Paulo');
    await searchInput.press('Enter');

    const cityResults = page.getByRole('combobox', { name: 'Resultados da busca' });
    const confirm = page.getByRole('button', { name: 'Ver previsão' });
    await expect(confirm).toBeDisabled();
    await cityResults.focus();
    await cityResults.selectOption({ label: 'São Paulo, São Paulo, Brasil' });
    await expect(confirm).toBeEnabled();
    expect(forecastRequests).toBe(0);

    await page.keyboard.press('Tab');
    await expect(confirm).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByText('22°C', { exact: true })).toBeVisible();
    expect(forecastRequests).toBe(1);
    await expectNoHorizontalOverflow(page);
  }
});

test('input inválido e cidade inexistente não mantêm clima anterior', async ({ page }) => {
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    const query = new URL(route.request().url()).searchParams.get('name');
    await route.fulfill({ json: query === 'Atlantis' ? {} : geocodingResponse });
  });
  await page.route('**/api.open-meteo.com/**', async (route) => {
    await route.fulfill({ json: forecastResponse });
  });

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await searchAndSelectCity(page);
    await expect(page.getByText('22°C', { exact: true })).toBeVisible();

    const searchInput = getSearchInput(page);
    await searchInput.fill('!!!');
    await searchInput.press('Enter');
    await expect(page.getByText('Informe o nome de uma cidade.')).toBeVisible();
    await expect(page.getByText('22°C', { exact: true })).toHaveCount(0);

    await searchInput.fill('Atlantis');
    await searchInput.press('Enter');
    await expect(page.getByText('Nenhuma cidade foi encontrada.')).toBeVisible();
    await expect(page.getByText('22°C', { exact: true })).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  }
});

test('somente a busca mais recente atualiza os resultados nos viewports suportados', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const requestUrl = new URL(String(input), window.location.href);
      if (requestUrl.searchParams.get('name') === 'Porto') {
        return originalFetch(input, { ...init, signal: undefined });
      }

      return originalFetch(input, init);
    };
  });

  let signalOlderSearchStart = () => {};
  let signalOlderResponseComplete = () => {};
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    const query = new URL(route.request().url()).searchParams.get('name');
    if (query === 'Porto') {
      signalOlderSearchStart();
      await new Promise((resolve) => setTimeout(resolve, 250));
      await route.fulfill({ json: portoGeocodingResponse });
      signalOlderResponseComplete();
      return;
    }

    await route.fulfill({ json: lisboaGeocodingResponse });
  });

  for (const viewport of viewports) {
    let resolveOlderSearchStarted!: () => void;
    let resolveOlderResponseComplete!: () => void;
    const olderSearchStarted = new Promise<void>((resolve) => {
      resolveOlderSearchStarted = resolve;
    });
    const olderResponseComplete = new Promise<void>((resolve) => {
      resolveOlderResponseComplete = resolve;
    });
    signalOlderSearchStart = resolveOlderSearchStarted;
    signalOlderResponseComplete = resolveOlderResponseComplete;

    await page.setViewportSize(viewport);
    await page.goto('/');
    const searchInput = getSearchInput(page);
    await searchInput.fill('Porto');
    await searchInput.press('Enter');
    await olderSearchStarted;

    await searchInput.fill('Lisboa');
    await searchInput.press('Enter');
    const latestResult = page.getByRole('option', { name: 'Lisboa, Lisboa, Portugal' });
    await expect(latestResult).toBeAttached();
    await olderResponseComplete;

    await expect(latestResult).toBeAttached();
    await expect(page.getByRole('option', { name: 'Porto, Porto, Portugal' })).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  }
});

test('previsão parcial identifica condições diárias indisponíveis', async ({ page }) => {
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({ json: geocodingResponse });
  });
  await page.route('**/api.open-meteo.com/**', async (route) => {
    await route.fulfill({ json: partialForecastResponse });
  });

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await searchAndSelectCity(page);

    await expect(page.getByText('Condição indisponível')).toHaveCount(5);
    await expectNoHorizontalOverflow(page);
  }
});

test('429 oferece retry do forecast nos viewports suportados', async ({ page }) => {
  let forecastAttempts = 0;
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({ json: geocodingResponse });
  });
  await page.route('**/api.open-meteo.com/**', async (route) => {
    forecastAttempts += 1;
    if (forecastAttempts === 1) {
      await route.fulfill({ status: 429, json: { error: true } });
      return;
    }

    await route.fulfill({ json: forecastResponse });
  });

  for (const viewport of viewports) {
    forecastAttempts = 0;
    await page.setViewportSize(viewport);
    await page.goto('/');
    await searchAndSelectCity(page);

    await expect(
      page.getByText('Limite de requisições atingido. Tente novamente em instantes.'),
    ).toBeVisible();
    const retryButton = page.getByRole('button', { name: 'Tentar novamente' });
    await retryButton.focus();
    await retryButton.press('Enter');
    await expect(page.getByText('22°C', { exact: true })).toBeVisible();
    expect(forecastAttempts).toBe(2);
    await expectNoHorizontalOverflow(page);
  }
});

test('falha de rede oferece retry nos viewports suportados', async ({ page }) => {
  let forecastAttempts = 0;
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({ json: geocodingResponse });
  });
  await page.route('**/api.open-meteo.com/**', async (route) => {
    forecastAttempts += 1;
    if (forecastAttempts === 1) {
      await route.abort();
      return;
    }

    await route.fulfill({ json: forecastResponse });
  });

  for (const viewport of viewports) {
    forecastAttempts = 0;
    await page.setViewportSize(viewport);
    await page.goto('/');
    await searchAndSelectCity(page);

    await expect(page.getByText('Não foi possível conectar ao serviço de clima.')).toBeVisible();
    await page.getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(page.getByText('22°C', { exact: true })).toBeVisible();
    expect(forecastAttempts).toBe(2);
    await expectNoHorizontalOverflow(page);
  }
});

test('busca offline oferece retry e recupera ao reconectar', async ({ page }) => {
  let offline = true;
  let geocodingRequests = 0;
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    geocodingRequests += 1;
    if (offline) {
      await route.abort('internetdisconnected');
      return;
    }
    await route.fulfill({ json: geocodingResponse });
  });

  for (const viewport of viewports) {
    offline = true;
    geocodingRequests = 0;
    await page.setViewportSize(viewport);
    await page.goto('/');
    const searchInput = getSearchInput(page);
    await searchInput.fill('São Paulo');
    await searchInput.press('Enter');

    await expect(page.getByRole('alert')).toContainText('Verifique sua internet');
    offline = false;
    await page.getByRole('button', { name: 'Tentar novamente' }).press('Enter');

    await expect(page.getByRole('combobox', { name: 'Resultados da busca' })).toBeFocused();
    expect(geocodingRequests).toBe(2);
    await expectNoHorizontalOverflow(page);
  }
});

test('previsão offline refaz somente o forecast ao reconectar', async ({ page }) => {
  let offline = true;
  let geocodingRequests = 0;
  let forecastRequests = 0;
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    geocodingRequests += 1;
    await route.fulfill({ json: geocodingResponse });
  });
  await page.route('**/api.open-meteo.com/**', async (route) => {
    forecastRequests += 1;
    if (offline) {
      await route.abort('internetdisconnected');
      return;
    }
    await route.fulfill({ json: forecastResponse });
  });

  for (const viewport of viewports) {
    offline = true;
    geocodingRequests = 0;
    forecastRequests = 0;
    await page.setViewportSize(viewport);
    await page.goto('/');
    await searchAndSelectCity(page);

    await expect(page.getByRole('alert')).toContainText('Verifique sua internet');
    offline = false;
    await page.getByRole('button', { name: 'Tentar novamente' }).press('Enter');

    await expect(page.getByRole('heading', { name: 'São Paulo' })).toBeFocused();
    expect(geocodingRequests).toBe(1);
    expect(forecastRequests).toBe(2);
    await expectNoHorizontalOverflow(page);
  }
});

test('timeout disponibiliza retry nos viewports suportados', async ({ page }) => {
  await page.addInitScript(() => {
    const originalSetTimeout = window.setTimeout.bind(window);
    const originalFetch = window.fetch.bind(window);

    window.setTimeout = ((handler: TimerHandler, delay?: number, ...args: unknown[]) =>
      originalSetTimeout(
        handler,
        delay === 10_000 ? 25 : delay,
        ...args,
      )) as typeof window.setTimeout;
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).includes('/v1/forecast')) {
        return new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            'abort',
            () => reject(new DOMException('Aborted', 'AbortError')),
            { once: true },
          );
        });
      }

      return originalFetch(input, init);
    };
  });
  await page.route('**/geocoding-api.open-meteo.com/**', async (route) => {
    await route.fulfill({ json: geocodingResponse });
  });

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await searchAndSelectCity(page);

    await expect(page.getByText('A consulta demorou mais de 10 segundos.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tentar novamente' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }
});
