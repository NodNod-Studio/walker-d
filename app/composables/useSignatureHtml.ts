/**
 * The email signature HTML from /api/signature (MJML template compiled at
 * build time, filled on the server). Debounced so typing a name doesn't fire
 * a request per keystroke; the previous result stays shown while loading.
 */
export function useSignatureHtml(fullname: MaybeRefOrGetter<string>, role: MaybeRefOrGetter<string>) {
  const query = refDebounced(computed(() => ({ fullname: toValue(fullname), role: toValue(role) })), 250)

  const { data } = useFetch('/api/signature', { query })

  return data
}
