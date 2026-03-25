// withLoading.js — wrapper untuk async command dengan loading state
export async function withLoading(setLoading, fn) {
  setLoading(true);
  try {
    return await fn();
  } finally {
    setLoading(false);
  }
}
