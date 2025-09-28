import { useColorScheme as useNativeColorScheme } from 'react-native';

// Define un tipo para mayor claridad y seguridad.
export type ColorScheme = 'light' | 'dark';

// Define la forma del objeto que devolverá nuestro hook.
interface UseColorScheme {
  colorScheme: ColorScheme;
  isDark: boolean;
}

/**
 * Un hook personalizado que envuelve el `useColorScheme` de React Native.
 * Proporciona el esquema de color actual y un booleano `isDark` para
 * facilitar las comprobaciones condicionales.
 */
export function useColorScheme(): UseColorScheme {
  // Obtiene el esquema de color del sistema ('light', 'dark', o null).
  const colorScheme = useNativeColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  return { colorScheme, isDark };
}
