/**
 * Normaliza un texto eliminando acentos y convirtiéndolo a minúsculas.
 * Ejemplo: 'José Pérez' -> 'jose perez'
 * @param text El texto a normalizar.
 * @returns El texto normalizado.
 */
export const normalizeText = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD') // Descompone los caracteres acentuados en carácter base + acento
    .replace(/[\u0300-\u036f]/g, ''); // Elimina los acentos
};
