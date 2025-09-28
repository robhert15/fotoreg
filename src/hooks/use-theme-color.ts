import { Colors } from '@/constants/theme';

import { useColorScheme } from 'react-native';

// Este hook detecta el tema de color actual (claro/oscuro) y devuelve el color apropiado.
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }
  
  return Colors[theme][colorName];
}
