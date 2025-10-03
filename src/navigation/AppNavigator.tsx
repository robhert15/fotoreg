import React from 'react';
import { NavigationContainer, RouteProp, NavigatorScreenParams } from '@react-navigation/native';
import { createStackNavigator, StackCardInterpolationProps } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';

// Importa todas las pantallas
import PatientListScreen from '@/screens/PatientListScreen';
import PatientDetailScreen from '@/screens/PatientDetailScreen';
import NewConsultationScreen from '@/screens/NewConsultationScreen';
import ConsultationDetailScreen from '@/screens/ConsultationDetailScreen';
import AddPatientScreen from '@/screens/AddPatientScreen';
import CameraScreen from '@/screens/CameraScreen';
import AppointmentsScreen from '@/screens/AppointmentsScreen';
import ReportsScreen from '@/screens/ReportsScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import { Patient } from '@/types';

// Define los tipos para las rutas
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<BottomTabParamList>;
  PatientDetail: { patientId: number };
  NewConsultation: { patientId: number; consultationId?: number };
  ConsultationDetail: { consultationId: number };
  AddPatient: { patient?: Patient }; // Hacer el paciente opcional
  Camera: { draftId: number; stage: 'antes' | 'despues' | 'voucher' };
};

export type BottomTabParamList = {
  PatientsStack: undefined;
  Appointments: undefined;
  Reports: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<BottomTabParamList>();
// Stack dedicado para el flujo de Pacientes (pantalla 'PatientList')
type PatientsStackParamList = { PatientList: undefined };
const PatientsStack = createStackNavigator<PatientsStackParamList>();

// Creamos un Stack anidado solo para el flujo de Pacientes
function PatientsStackNavigator() {
  return (
    <PatientsStack.Navigator screenOptions={{ headerShown: false }}>
      <PatientsStack.Screen name="PatientList" component={PatientListScreen} />
      {/* Las pantallas a las que se navega desde la lista van aquí */}
    </PatientsStack.Navigator>
  );
}

// Creamos nuestro navegador de pestañas principal
function MainTabNavigator() {
  const primaryColor = useThemeColor({}, 'primary');
  const grayColor = useThemeColor({}, 'icon'); // Usar el color 'icon' que ya existe
  const surfaceColor = useThemeColor({}, 'surface');
  const outlineColor = useThemeColor({}, 'outline');

  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: RouteProp<BottomTabParamList, keyof BottomTabParamList> }) => ({
        headerShown: false,
        tabBarActiveTintColor: primaryColor,
        tabBarInactiveTintColor: grayColor,
        tabBarStyle: {
          position: 'absolute',
          bottom: 30,
          left: 20,
          right: 20,
          backgroundColor: surfaceColor,
          borderRadius: 15,
          height: 70,
          // Flat: sin sombras
          elevation: 0,
          shadowColor: 'transparent',
          // Delimitación sutil
          borderWidth: 1,
          borderColor: outlineColor,
        },
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          const iconsMap: Record<keyof BottomTabParamList, keyof typeof Ionicons.glyphMap> = {
            PatientsStack: 'people',
            Appointments: 'calendar',
            Reports: 'stats-chart',
            Settings: 'settings-sharp',
          };
          return <Ionicons name={iconsMap[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="PatientsStack" component={PatientsStackNavigator} options={{ title: 'Pacientes' }} />
      <Tab.Screen name="Appointments" component={AppointmentsScreen} options={{ title: 'Citas' }} />
      <Tab.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reportes' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Ajustes' }} />
    </Tab.Navigator>
  );
}

// El navegador principal ahora es un Stack que contiene el Tab Navigator y las pantallas modales
export default function AppNavigator() {
  const backgroundColor = useThemeColor({}, 'background');

  const forFade = ({ current }: StackCardInterpolationProps) => ({
    cardStyle: {
      opacity: current.progress,
    },
  });

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
        headerShown: false, 
        cardStyle: { backgroundColor },
        cardStyleInterpolator: forFade
      }}>
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        {/* Las pantallas que deben aparecer POR ENCIMA de las pestañas van aquí */}
        <Stack.Screen name="PatientDetail" component={PatientDetailScreen} />
        <Stack.Screen name="NewConsultation" component={NewConsultationScreen} />
        <Stack.Screen name="ConsultationDetail" component={ConsultationDetailScreen} />
        <Stack.Screen name="AddPatient" component={AddPatientScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
