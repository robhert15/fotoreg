import { useState, useEffect } from 'react';
import { Keyboard, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Hook personalizado para calcular la posición óptima de los botones flotantes (FAB)
 * considerando el teclado del dispositivo y las áreas seguras.
 */
export const useFabPosition = (screenPercentage: number = 0.75) => {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (event) => {
      setKeyboardHeight(event.endCoordinates.height);
      setIsKeyboardVisible(true);
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  // Calcular la posición óptima del botón
  const fabTop = () => {
    if (isKeyboardVisible) {
      // Cuando el teclado está visible, posicionar el FAB arriba del teclado
      // Dejamos un margen de 100px entre el teclado y el botón para formularios
      const targetPosition = height - keyboardHeight - 100;
      // Asegurar que no esté demasiado alto (mínimo 10% desde arriba)
      const minPosition = height * 0.1;
      return Math.max(targetPosition, minPosition);
    } else {
      // Posición normal: porcentaje personalizable de la pantalla desde arriba
      return height * screenPercentage;
    }
  };

  return {
    fabTop: fabTop(),
    isKeyboardVisible,
    keyboardHeight,
  };
};
