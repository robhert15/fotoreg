import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ImageBackground } from 'react-native';
import { CameraView, useCameraPermissions, CameraCapturedPicture } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { addPhoto } from '@/db/api/consultations';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { Image } from 'expo-image';
import { logger } from '@/utils/logger';

export default function CameraScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Camera'>>();
  const { draftId, stage } = route.params;

  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<CameraCapturedPicture | null>(null);
  const [previewError, setPreviewError] = useState<boolean>(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    // Permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Permissions are not granted yet
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Necesitamos tu permiso para mostrar la cámara</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
            <Text style={styles.buttonText}>Conceder Permiso</Text>
        </Pressable>
      </View>
    );
  }
  
  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const pic = await cameraRef.current.takePictureAsync({ quality: 1, exif: true, skipProcessing: false });
      if (__DEV__) {
        logger.debug('Foto capturada', { uri: pic?.uri, width: pic?.width, height: pic?.height });
      }
      setPreviewError(false);
      setPhoto(pic);
    } catch (e) {
      logger.error('Error capturando foto', e as Error);
      Alert.alert('Error', 'No se pudo capturar la foto. Intenta nuevamente.');
    }
  };

  const handleAccept = async () => {
    if (!photo) return;
    try {
      await addPhoto(draftId, photo.uri, stage);
      navigation.goBack();
    } catch (e) {
      logger.error('Error al guardar la foto', e as Error);
      Alert.alert('Error', 'No se pudo guardar la foto. Intenta nuevamente.');
    }
  };

  if (photo) {
    // Preview screen after taking a picture
    return (
      <View style={styles.previewContainer}>
        {!previewError ? (
          <Image
            source={{ uri: photo.uri }}
            style={StyleSheet.absoluteFill}
            contentFit="contain"
            onError={(e) => { logger.error('Error mostrando preview (expo-image)', e as unknown as Error); setPreviewError(true); }}
          />
        ) : (
          <ImageBackground
            source={{ uri: photo.uri }}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
          />
        )}
        <View style={styles.previewButtonContainer}>
          <Pressable style={styles.previewButton} onPress={() => setPhoto(null)}>
            <Ionicons name="repeat" size={32} color="white" />
            <Text style={styles.previewButtonText}>Reintentar</Text>
          </Pressable>
          <Pressable style={styles.previewButton} onPress={handleAccept}>
            <Ionicons name="checkmark-circle" size={32} color="white" />
            <Text style={styles.previewButtonText}>Aceptar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // Camera view
  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing="back" ref={cameraRef} />
        <View style={styles.cameraOverlay}>
          <Pressable style={styles.captureButton} onPress={takePicture} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  permissionText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 18,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    margin: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  cameraContainer: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 30,
  },
  captureButton: {
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 50,
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  previewButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 20,
  },
  previewButton: {
    alignItems: 'center',
  },
  previewButtonText: {
    color: 'white',
    fontSize: 16,
    marginTop: 5,
  }
});
