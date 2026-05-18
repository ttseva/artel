import "dotenv/config";

const BASE_URL = `http://127.0.0.1:${process.env.PORT || 5000}/api`;

const payloads = [
  { name: "Null payload", data: null },
  { name: "Empty object", data: {} },
  { name: "Empty array", data: [] },
  { name: "Empty string", data: "" },
  { name: "Wrong type (number)", data: 123 },
  { name: "Wrong type (boolean)", data: true },
  { name: "Incorrect structure (only email)", data: { email: "test@example.com" } },
  { name: "Invalid email format", data: { name: "Test", email: "not-an-email", password: "password123" } },
  { name: "Oversized name", data: { name: "A".repeat(5000), email: "big@example.com", password: "password123" } },
  { name: "Privilege escalation attempt", data: { name: "Hacker", email: "hacker@example.com", password: "password123", role: "admin" } }
];

async function runFuzzing() {
  const results = [];

  // 1. Тестирование авторизации
  for (const payload of payloads) {
    try {
      const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload.data !== null && typeof payload.data === 'object' && !Array.isArray(payload.data) 
              ? JSON.stringify(payload.data) 
              : (typeof payload.data === 'string' ? payload.data : JSON.stringify(payload.data))
      });
      
      const status = response.status;
      const body = await response.json().catch(() => ({ message: "Non-JSON response" }));
      
      results.push({
        endpoint: "/auth/register",
        test: payload.name,
        status: status,
        result: status >= 400 ? "OK (Handled)" : "WARNING (Accepted)",
        message: body.message || "No message"
      });
      
      console.log(`[${status}] ${payload.name}: ${body.message || "No message"}`);
    } catch (error) {
      console.log(`[ERR] ${payload.name}: ${error.message}`);
    }
  }

  // 2. Тестирование изделий /api/products
  const productPayloads = [
    { name: "No token", data: { title: "Test", price: 100 }, token: null },
    { name: "Invalid structure", data: { something: "else" }, token: "invalid-token" }
  ];

  for (const p of productPayloads) {
    try {
      const response = await fetch(`${BASE_URL}/products`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(p.token ? { "Authorization": `Bearer ${p.token}` } : {})
        },
        body: JSON.stringify(p.data)
      });
      
      const status = response.status;
      const body = await response.json().catch(() => ({ message: "Non-JSON response" }));
      
      results.push({
        endpoint: "/products",
        test: p.name,
        status: status,
        result: status >= 400 ? "OK (Handled)" : "WARNING (Accepted)",
        message: body.message || "No message"
      });
      
      console.log(`[${status}] ${p.name}: ${body.message || "No message"}`);
    } catch (error) {
      console.log(`[ERR] ${p.name}: ${error.message}`);
    }
  }

  console.table(results.map(r => ({
    "Endpoint": r.endpoint,
    "Test Case": r.test,
    "Status": r.status,
    "Result": r.result
  })));
}

runFuzzing();
