export function normalizePhotoUrls(value: unknown): string[] {
  const values = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
  return [...new Set(
    values
      .filter((photo): photo is string => typeof photo === 'string')
      .map((photo) => photo.trim())
      .filter(Boolean)
  )];
}

export function mergePhotoUrls(...values: unknown[]): string[] {
  return normalizePhotoUrls(values.flatMap((value) => normalizePhotoUrls(value)));
}
