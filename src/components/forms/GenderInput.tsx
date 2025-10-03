import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

type Gender = 'Masculino' | 'Femenino';

interface GenderInputProps {
  label: string;
  value: Gender | null;
  onValueChange: (value: Gender) => void;
}

export default function GenderInput({ label, value, onValueChange }: GenderInputProps) {
  const options: Gender[] = ['Masculino', 'Femenino'];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.optionsContainer}>
        {options.map((option) => (
          <Pressable
            key={option}
            style={styles.optionButton}
            onPress={() => onValueChange(option)}
            hitSlop={10}
          >
            <Ionicons
              name={value === option ? 'radio-button-on' : 'radio-button-off'}
              size={24}
              color={value === option ? Colors.light.primary : Colors.light.icon}
            />
            <Text style={styles.optionText}>{option}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20, // Espaciado consistente con otros campos
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 24, // Espacio entre los dos botones
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  optionText: {
    fontSize: 16,
    color: Colors.light.text,
  },
});
