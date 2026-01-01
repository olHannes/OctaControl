// js/api.js

async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(path, {
    method,
    headers: {
      "Accept": "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body? JSON.stringify(body): undefined,
  });

  let data = null;
  const ct =  res.headers.get("content-type") || "";
  if (ct.includes("application/json")) data = await res.json().catch(() => null);

  if(!res.ok) {
    const msg = data?.message ?? `${method} ${path} failed: ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

export const apiGet = (p) => request(p);
export const apiPost = (p, b) => request(p, { method: "POST", body: b});
export const apiPatch = (p, b) => request(p, { method: "PATCH", body: b});