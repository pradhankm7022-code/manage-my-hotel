const SCRIPT_URL = import.meta.env.VITE_SCRIPT_URL

export async function call(action, payload = {}) {
  const token = localStorage.getItem('mmh_token')
  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ action, token, payload }),
  })
  if (!res.ok) throw new Error('Network error')
  const data = await res.json()
  if (!data.success) throw new Error(data.message || 'Request failed')
  return data.result
}

export async function publicCall(action, payload = {}) {
  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ action, payload }),
  })
  if (!res.ok) throw new Error('Network error')
  const data = await res.json()
  if (!data.success) throw new Error(data.message || 'Request failed')
  return data.result
}
