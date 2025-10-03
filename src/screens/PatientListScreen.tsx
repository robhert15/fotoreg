import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, useWindowDimensions, Pressable } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { globalStyles } from '@/styles/globalStyles';
import { ScreenLayout } from '@/components/layout/ScreenLayout';
import { useNavigation, useFocusEffect, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { FabButton } from '@/components/buttons/FabButton';
import { PatientCard } from '@/components/PatientCard';
import { useThemeColor } from '@/hooks/use-theme-color';
import { logger } from '@/utils/logger';

import { PatientWithLastDiagnosis } from '@/types';
import { findPatientsWithLastConsultation } from '@/db/api/patients';

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 150,
  },
  subHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  resultsCount: {
    fontSize: 14,
  },
  orderByButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});

export default function PatientListScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [patients, setPatients] = useState<PatientWithLastDiagnosis[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderBy, setOrderBy] = useState<'recent' | 'asc' | 'desc'>('recent');
  const { height } = useWindowDimensions();

  const colors = {
    primary: useThemeColor({}, 'primary'),
    secondary: useThemeColor({}, 'secondary'),
    background: useThemeColor({}, 'background'),
    text: useThemeColor({}, 'text'),
    textLight: useThemeColor({}, 'textLight'),
    white: useThemeColor({}, 'white'),
    borderColor: useThemeColor({}, 'borderColor'),
  };

  const loadPatients = useCallback(async () => {
    try {
      const patientsData = await findPatientsWithLastConsultation(searchTerm, orderBy);
      setPatients(patientsData);
    } catch (error) {
      logger.error('loadPatients failed', error as Error);
      Alert.alert('Error', 'No se pudieron buscar los pacientes.');
    }
  }, [searchTerm, orderBy]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadPatients();
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, orderBy, loadPatients]);

  useFocusEffect(
    useCallback(() => {
      if (searchTerm === '') {
        loadPatients();
      }
    }, [searchTerm, orderBy, loadPatients])
  );

  return (
    <View style={{ flex: 1 }}>
      <ScreenLayout
        title="Pacientes"
        renderScrollable={({ onScroll, scrollEventThrottle, contentContainerStyle }) => (
          <Animated.FlatList
            data={patients}
            keyExtractor={(item) => item.id.toString()}
            keyboardShouldPersistTaps='handled'
            removeClippedSubviews={true}
            renderItem={({ item }) => (
              <PatientCard 
                patient={item}
                onPress={() => navigation.navigate('PatientDetail', { patientId: item.id })}
              />
            )}
            onScroll={onScroll}
            scrollEventThrottle={scrollEventThrottle}
            contentContainerStyle={[styles.listContent, contentContainerStyle]}
            ListHeaderComponent={
              <>
                <View style={globalStyles.searchSection}>
                  <View style={globalStyles.searchContainer}>
                    <Ionicons name="search" size={18} color={colors.textLight} style={globalStyles.searchIcon} />
                    <TextInput
                      style={[globalStyles.searchInput, { borderColor: colors.borderColor, color: colors.text, backgroundColor: colors.background }]}
                      placeholder="Buscar por nombre o documento..."
                      placeholderTextColor={colors.textLight}
                      value={searchTerm}
                      onChangeText={setSearchTerm}
                    />
                    {searchTerm.length > 0 && (
                      <Pressable onPress={() => setSearchTerm('')} style={globalStyles.clearIcon} hitSlop={60}>
                        <Ionicons name="close-circle" size={20} color={colors.textLight} />
                      </Pressable>
                    )}
                  </View>
                </View>
                <View style={styles.subHeaderContainer}>
                  <Text style={[styles.resultsCount, { color: colors.textLight }]}>
                    {patients.length} pacientes encontrados
                  </Text>
                  <TouchableOpacity onPress={() => setOrderBy(prev => prev === 'recent' ? 'asc' : prev === 'asc' ? 'desc' : 'recent')} style={styles.orderByButton} hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
                    <Ionicons name="swap-vertical" size={16} color={colors.textLight} />
                    <Text style={{ color: colors.textLight }}>
                      {orderBy === 'recent' ? 'Recientes' : orderBy === 'asc' ? 'A-Z' : 'Z-A'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            }
          />
        )}
      />
      <FabButton
        style={[globalStyles.fab, { top: height * 0.75 }]}
        variant="primary"
        onPress={() => navigation.navigate('AddPatient', {})}
        accessibilityLabel="Registrar paciente"
        icon={<Ionicons name="add" size={24} color={colors.white} />}
      />
    </View>
  );
}
