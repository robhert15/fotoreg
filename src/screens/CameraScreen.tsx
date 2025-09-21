import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ImageBackground } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function CameraScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { onPictureTaken } = route.params as { onPictureTaken: (uri: string) => void };

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

  const handleAccept = () => {
    if (photo) {
      onPictureTaken(photo.uri);
      navigation.goBack();
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
      <CameraView style={styles.camera} facing="back" ref={cameraRef}>
        <View style={styles.cameraButtonContainer}>
          <Pressable style={styles.captureButton} onPress={takePicture} />
        </View>
      </CameraView>
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
  cameraButtonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 30,
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
