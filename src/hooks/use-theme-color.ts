import { Colors } from '@/constants/theme';

// Este es un hook simplificado. En el futuro, podría leer el tema actual (claro/oscuro).
// Por ahora, siempre devuelve los colores del tema 'light'.

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = 'light'; // Hardcodeado por ahora
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }
  
  return Colors[theme][colorName];
}
