export async function submitPublicForm(payload) {
  const response = await fetch('/api/public-submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || 'Unable to submit your request. Please try again.');
  }
  return result;
}
