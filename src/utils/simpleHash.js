export function simpleHashToNumber(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function pickDeterministic(list, keyText) {
  if (!list.length) return "";
  const n = simpleHashToNumber(keyText);
  return list[n % list.length];
}
