import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { addPhoto } from '@/db/api/consultations';
import { RootStackParamList } from '@/navigation/AppNavigator';

export default function CameraScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'Camera'>>();
  const { draftId, stage } = route.params;

  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<any>(null);
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
    if (cameraRef.current) {
      const pic = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      setPhoto(pic);
    }
  };

  const handleAccept = async () => {
    if (!photo) return;
    try {
      await addPhoto(draftId, photo.uri, stage);
      navigation.goBack();
    } catch (e) {
      console.error('Error al guardar la foto:', e);
      Alert.alert('Error', 'No se pudo guardar la foto. Intenta nuevamente.');
    }
  };

  if (photo) {
    // Preview screen after taking a picture
    return (
      <ImageBackground source={{ uri: photo.uri }} style={styles.previewContainer}>
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
      </ImageBackground>
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
