import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import PatientListScreen from '../screens/PatientListScreen';
import AddPatientScreen from '../screens/AddPatientScreen';
import PatientDetailScreen from '../screens/PatientDetailScreen';
import NewConsultationScreen from '../screens/NewConsultationScreen';
import CameraScreen from '../screens/CameraScreen';
import ConsultationDetailScreen from '../screens/ConsultationDetailScreen';
import { Patient } from '@/types';

export type RootStackParamList = {
  PatientList: undefined;
  AddPatient: { onPatientAdded: () => void };
  PatientDetail: { patientId: number };
  NewConsultation: { patientId: number; consultationId?: number };
  Camera: { onPictureTaken: (uri: string) => void };
  ConsultationDetail: { consultationId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="PatientList">
        <Stack.Screen 
          name="PatientList" 
          component={PatientListScreen} 
          options={{ title: 'Pacientes' }} 
        />
        <Stack.Screen 
          name="AddPatient" 
          component={AddPatientScreen} 
          options={{ title: 'Registrar Paciente' }} 
        />
        <Stack.Screen 
          name="PatientDetail" 
          component={PatientDetailScreen} 
          options={{ title: 'Detalles del Paciente' }} 
        />
        <Stack.Screen 
          name="NewConsultation" 
          component={NewConsultationScreen} 
          options={{ headerShown: false }} // El header personalizado está dentro de la pantalla
        />
        <Stack.Screen 
          name="Camera" 
          component={CameraScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ConsultationDetail" 
          component={ConsultationDetailScreen} 
          options={{ title: 'Detalles de la Consulta' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
