import "dotenv/config";
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const BASE_URL = `http://127.0.0.1:${process.env.PORT || 5000}/api`;
const RUNS_PER_PROPERTY = 50;
const FAKE_OBJECT_ID = "507f1f77bcf86cd799439011";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPORT_PATH = join(__dirname, "..", "fuzz-report.json");

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (items) => items[rand(0, items.length - 1)];
const randomString = (length = rand(1, 64)) =>
  Array.from({ length }, () =>
    String.fromCharCode(rand(32, 126)),
  ).join("");

const generators = {
  name: (i) =>
    pick([
      null,
      undefined,
      "",
      "   ",
      rand(0, 1) ? randomString(rand(500, 5000)) : randomString(1),
      rand(0, 999999),
      rand(0, 1) === 1,
      [],
      {},
      { nested: "value" },
      `user_${i}`,
    ]),

  email: (i) =>
    pick([
      null,
      "",
      "not-an-email",
      "missing-at.com",
      "@no-local.com",
      `bad${i}`,
      randomString(120),
      rand(0, 999),
      rand(0, 1) === 1,
      [],
      `fuzz_${i}_${randomString(6)}@test.local`,
    ]),

  password: (i) =>
    pick([
      null,
      "",
      "123",
      "12345",
      randomString(rand(200, 800)),
      rand(0, 999999),
      rand(0, 1) === 1,
      [],
      {},
      `pass_${i}_${randomString(4)}`,
    ]),

  role: () =>
    pick([
      null,
      "",
      "admin",
      "root",
      "superuser",
      "master",
      "buyer",
      rand(0, 999),
      rand(0, 1) === 1,
      randomString(12),
      [],
    ]),

  objectId: (i) =>
    pick([
      null,
      "",
      "invalid",
      "123",
      "zzzzzzzzzzzzzzzzzzzzzzzz",
      randomString(24),
      randomString(rand(5, 40)),
      `${i}`.repeat(12),
      "000000000000000000000000",
      rand(0, 999999999),
      {},
    ]),

  price: () =>
    pick([
      null,
      "",
      0,
      -1,
      -rand(1, 10000),
      rand(0, 1) ? "100" : randomString(8),
      rand(0, 1) === 1,
      [],
      {},
      Number.NaN,
      Number.POSITIVE_INFINITY,
    ]),

  category: () =>
    pick([
      null,
      "",
      "invalid",
      "food",
      "ADMIN",
      randomString(rand(3, 30)),
      rand(0, 999),
      rand(0, 1) === 1,
      [],
      "jewelry",
    ]),

  status: () =>
    pick([
      null,
      "",
      "invalid",
      "pending",
      "done",
      "ADMIN",
      randomString(rand(3, 20)),
      rand(0, 999),
      rand(0, 1) === 1,
      "created",
    ]),

  text: (i) =>
    pick([
      null,
      "",
      "   ",
      randomString(rand(500, 3000)),
      rand(0, 999),
      rand(0, 1) === 1,
      [],
      {},
      `msg_${i}`,
    ]),

  comment: (i) =>
    pick([
      null,
      rand(0, 999999),
      rand(0, 1) === 1,
      [],
      {},
      randomString(rand(0, 2000)),
      "",
      `comment_${i}`,
    ]),

  token: () =>
    pick([
      null,
      "",
      "invalid-token",
      "Bearer broken",
      randomString(rand(16, 120)),
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.sig",
    ]),
};

function uniqueEmail() {
  return `fuzz_${Date.now()}_${randomString(8)}@test.local`;
}

function validRegisterBody() {
  return {
    name: "Fuzz User",
    email: uniqueEmail(),
    password: "password123",
  };
}

function validProductBody() {
  return {
    title: "Fuzz product",
    description: "Generated test item",
    price: rand(100, 5000),
    image: "https://example.com/image.jpg",
    category: pick(["jewelry", "decor", "clothing", "accessories"]),
  };
}

function validLoginBody() {
  return {
    email: uniqueEmail(),
    password: "password123",
  };
}

function validOrderBody(productId) {
  return {
    productId,
    comment: "fuzz order",
  };
}

function validMessageBody() {
  return { text: "fuzz message" };
}

function validUserUpdateBody() {
  return {
    name: "Updated Name",
    email: uniqueEmail(),
  };
}

async function request(method, path, { body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const init = { method, headers };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, init);
  const raw = await response.text();
  let parsed = null;

  try {
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    parsed = { message: raw.slice(0, 200) || "Non-JSON response" };
  }

  return {
    status: response.status,
    body: parsed,
  };
}

async function registerUser(role = "buyer") {
  const payload = { ...validRegisterBody(), role };
  const { status, body } = await request("POST", "/auth/register", {
    body: payload,
  });

  if (status !== 201) {
    throw new Error(
      `Failed to register ${role}: ${status} ${body?.message || ""}`,
    );
  }

  return body.token;
}

function classify(status, expectClientError = true) {
  if (status >= 500) {
    return { verdict: "fail", label: "Server error (5xx)" };
  }

  if (expectClientError) {
    if (status >= 400 && status < 500) {
      return { verdict: "pass", label: "Handled (4xx)" };
    }
    if (status >= 200 && status < 300) {
      return { verdict: "warn", label: "Accepted (2xx)" };
    }
  }

  return { verdict: "pass", label: "OK" };
}

function createReportStore() {
  return {
    startedAt: new Date().toISOString(),
    finishedAt: null,
    config: { baseUrl: BASE_URL, runsPerProperty: RUNS_PER_PROPERTY },
    summary: { total: 0, pass: 0, warn: 0, fail: 0 },
    byEndpoint: {},
    details: [],
  };
}

function recordResult(report, entry) {
  const { verdict, label } = classify(entry.status, entry.expectClientError);
  const row = {
    ...entry,
    verdict,
    verdictLabel: label,
    message: entry.body?.message || "",
  };

  report.details.push(row);
  report.summary.total += 1;
  report.summary[verdict] += 1;

  if (!report.byEndpoint[entry.endpoint]) {
    report.byEndpoint[entry.endpoint] = { pass: 0, warn: 0, fail: 0, total: 0 };
  }

  report.byEndpoint[entry.endpoint].total += 1;
  report.byEndpoint[entry.endpoint][verdict] += 1;

  return row;
}

async function fuzzProperty(report, config) {
  const {
    endpoint,
    method,
    path,
    property,
    generator,
    baseline,
    token,
    expectClientError = true,
  } = config;

  for (let i = 0; i < RUNS_PER_PROPERTY; i += 1) {
    const value = generator(i);
    const body =
      baseline === undefined
        ? value
        : { ...baseline(), [property]: value };

    const { status, body: responseBody } = await request(method, path, {
      body,
      token: typeof token === "function" ? token(i) : token,
    });

    recordResult(report, {
      endpoint,
      method,
      property,
      run: i + 1,
      input: value,
      status,
      body: responseBody,
      expectClientError,
    });
  }
}

async function fuzzAuth(report, config) {
  const { endpoint, method, path, body, tokenGenerator } = config;

  for (let i = 0; i < RUNS_PER_PROPERTY; i += 1) {
    const token = tokenGenerator(i);
    const { status, body: responseBody } = await request(method, path, {
      body: typeof body === "function" ? body(i) : body,
      token,
    });

    recordResult(report, {
      endpoint,
      method,
      property: "Authorization",
      run: i + 1,
      input: token ?? "(none)",
      status,
      body: responseBody,
      expectClientError: true,
    });
  }
}

async function fuzzPathParam(report, config) {
  const {
    endpoint,
    method,
    pathFor,
    param,
    generator,
    body,
    token,
  } = config;

  for (let i = 0; i < RUNS_PER_PROPERTY; i += 1) {
    const value = generator(i);
    const path = pathFor(value);
    const { status, body: responseBody } = await request(method, path, {
      body: typeof body === "function" ? body(i) : body,
      token,
    });

    recordResult(report, {
      endpoint,
      method,
      property: param,
      run: i + 1,
      input: value,
      status,
      body: responseBody,
      expectClientError: true,
    });
  }
}

async function ensureServerAvailable() {
  try {
    const response = await fetch(`${BASE_URL}`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }
  } catch (error) {
    throw new Error(
      `Server is not available at ${BASE_URL}. Start it before fuzzing. ${error.message}`,
    );
  }
}

async function runFuzzing() {
  const report = createReportStore();

  console.log(`Fuzz testing ${BASE_URL}`);
  console.log(`${RUNS_PER_PROPERTY} runs per property\n`);

  await ensureServerAvailable();

  let masterToken = null;
  let buyerToken = null;
  let sampleProductId = null;

  try {
    masterToken = await registerUser("master");
    buyerToken = await registerUser("buyer");

    const productsResponse = await request("GET", "/products");
    sampleProductId = productsResponse.body?.[0]?._id || null;
  } catch (error) {
    console.warn(`Setup warning: ${error.message}`);
  }

  // Авторизация
  await fuzzProperty(report, {
    endpoint: "POST /auth/register",
    method: "POST",
    path: "/auth/register",
    property: "name",
    generator: generators.name,
    baseline: validRegisterBody,
  });

  await fuzzProperty(report, {
    endpoint: "POST /auth/register",
    method: "POST",
    path: "/auth/register",
    property: "email",
    generator: generators.email,
    baseline: validRegisterBody,
  });

  await fuzzProperty(report, {
    endpoint: "POST /auth/register",
    method: "POST",
    path: "/auth/register",
    property: "password",
    generator: generators.password,
    baseline: validRegisterBody,
  });

  await fuzzProperty(report, {
    endpoint: "POST /auth/register",
    method: "POST",
    path: "/auth/register",
    property: "role",
    generator: generators.role,
    baseline: validRegisterBody,
  });

  await fuzzProperty(report, {
    endpoint: "POST /auth/login",
    method: "POST",
    path: "/auth/login",
    property: "email",
    generator: generators.email,
    baseline: validLoginBody,
  });

  await fuzzProperty(report, {
    endpoint: "POST /auth/login",
    method: "POST",
    path: "/auth/login",
    property: "password",
    generator: generators.password,
    baseline: validLoginBody,
  });

  // Изделия (чтение)
  await fuzzPathParam(report, {
    endpoint: "GET /products/:id",
    method: "GET",
    param: "id",
    pathFor: (id) => `/products/${encodeURIComponent(String(id))}`,
    generator: generators.objectId,
  });

  // Изделия (запись)
  if (masterToken) {
    for (const property of ["title", "description", "image", "category"]) {
      await fuzzProperty(report, {
        endpoint: "POST /products",
        method: "POST",
        path: "/products",
        property,
        generator:
          property === "category" ? generators.category : generators.name,
        baseline: validProductBody,
        token: masterToken,
      });
    }

    await fuzzProperty(report, {
      endpoint: "POST /products",
      method: "POST",
      path: "/products",
      property: "price",
      generator: generators.price,
      baseline: validProductBody,
      token: masterToken,
    });

    await fuzzAuth(report, {
      endpoint: "POST /products",
      method: "POST",
      path: "/products",
      body: validProductBody,
      tokenGenerator: generators.token,
    });

    await fuzzPathParam(report, {
      endpoint: "PUT /products/:id",
      method: "PUT",
      param: "id",
      pathFor: (id) => `/products/${encodeURIComponent(String(id))}`,
      generator: generators.objectId,
      body: () => ({ title: "Updated" }),
      token: masterToken,
    });
  }

  // Заказы
  if (buyerToken) {
    await fuzzProperty(report, {
      endpoint: "POST /orders",
      method: "POST",
      path: "/orders",
      property: "productId",
      generator: generators.objectId,
      baseline: () => validOrderBody(sampleProductId || FAKE_OBJECT_ID),
      token: buyerToken,
    });

    await fuzzProperty(report, {
      endpoint: "POST /orders",
      method: "POST",
      path: "/orders",
      property: "comment",
      generator: generators.comment,
      baseline: () => validOrderBody(sampleProductId || FAKE_OBJECT_ID),
      token: buyerToken,
    });

    await fuzzPathParam(report, {
      endpoint: "GET /orders/:id",
      method: "GET",
      param: "id",
      pathFor: (id) => `/orders/${encodeURIComponent(String(id))}`,
      generator: generators.objectId,
      token: buyerToken,
    });
  }

  if (masterToken) {
    await fuzzPathParam(report, {
      endpoint: "PATCH /orders/:id/status",
      method: "PATCH",
      param: "id",
      pathFor: (id) => `/orders/${encodeURIComponent(String(id))}/status`,
      generator: generators.objectId,
      body: () => ({ status: "in_progress" }),
      token: masterToken,
    });

    await fuzzProperty(report, {
      endpoint: "PATCH /orders/:id/status",
      method: "PATCH",
      path: `/orders/${FAKE_OBJECT_ID}/status`,
      property: "status",
      generator: generators.status,
      baseline: () => ({}),
      token: masterToken,
    });
  }

  // Messages
  if (buyerToken) {
    await fuzzPathParam(report, {
      endpoint: "POST /orders/:id/messages",
      method: "POST",
      param: "id",
      pathFor: (id) => `/orders/${encodeURIComponent(String(id))}/messages`,
      generator: generators.objectId,
      body: validMessageBody,
      token: buyerToken,
    });

    await fuzzProperty(report, {
      endpoint: "POST /orders/:id/messages",
      method: "POST",
      path: `/orders/${FAKE_OBJECT_ID}/messages`,
      property: "text",
      generator: generators.text,
      baseline: validMessageBody,
      token: buyerToken,
    });
  }

  // Профиль пользователя
  if (buyerToken) {
    for (const property of ["name", "email", "password"]) {
      await fuzzProperty(report, {
        endpoint: "PUT /users/me",
        method: "PUT",
        path: "/users/me",
        property,
        generator:
          property === "email"
            ? generators.email
            : property === "password"
              ? generators.password
              : generators.name,
        baseline: validUserUpdateBody,
        token: buyerToken,
      });
    }
  }

  report.finishedAt = new Date().toISOString();
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf-8");

  printReport(report);
}

function printReport(report) {
  const { summary, byEndpoint } = report;

  console.log("\n=== Fuzz report ===");
  console.log(
    `Total: ${summary.total} | Pass: ${summary.pass} | Warn: ${summary.warn} | Fail: ${summary.fail}`,
  );

  console.log("\nBy endpoint:");
  console.table(
    Object.entries(byEndpoint).map(([endpoint, stats]) => ({
      Endpoint: endpoint,
      Total: stats.total,
      Pass: stats.pass,
      Warn: stats.warn,
      Fail: stats.fail,
    })),
  );

  const problems = report.details.filter((row) => row.verdict !== "pass");
  if (problems.length > 0) {
    console.log("\nIssues (first 20):");
    console.table(
      problems.slice(0, 20).map((row) => ({
        Endpoint: row.endpoint,
        Property: row.property,
        Run: row.run,
        Status: row.status,
        Verdict: row.verdictLabel,
        Message: row.message,
      })),
    );
  }

  console.log(`\nFull report saved to: ${REPORT_PATH}`);
}

runFuzzing().catch((error) => {
  console.error(`Fuzzing failed: ${error.message}`);
  process.exit(1);
});
