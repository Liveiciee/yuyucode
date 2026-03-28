// test-client.js
const res = await fetch("http://127.0.0.1:8765", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ type: "ping" })
});

console.log(await res.json());
