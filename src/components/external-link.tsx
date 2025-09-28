import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform, Pressable } from 'react-native';

type Props = Omit<ComponentProps<typeof Pressable>, 'href'> & { href: string };

export function ExternalLink({ href, ...rest }: Props) {
  const handlePress = async () => {
    // Para plataformas nativas, usa el navegador en la app.
    if (Platform.OS !== 'web') {
      await openBrowserAsync(href, {
        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
      });
    } else {
      // Para web, abre en una nueva pestaña.
      window.open(href, '_blank');
    }
  };

  return (
    <Pressable
      accessibilityRole="link"
      onPress={handlePress}
      {...rest}
    />
  );
}
