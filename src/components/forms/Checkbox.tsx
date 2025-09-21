import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- Componente Atómico: Checkbox Individual ---
interface CheckboxProps {
  label: string;
  isChecked: boolean;
  onPress: () => void;
  disabled?: boolean;
}

const Checkbox = ({ label, isChecked, onPress, disabled = false }: CheckboxProps) => {
  return (
    <Pressable style={[styles.checkboxContainer, disabled && styles.disabled]} onPress={onPress} disabled={disabled}>
      <View style={[styles.checkboxBase, isChecked && styles.checkboxChecked, disabled && styles.checkboxDisabled]}>
        {isChecked && <Ionicons name="checkmark" size={18} color="white" />}
      </View>
      <Text style={[styles.checkboxLabel, disabled && styles.checkboxLabelDisabled]}>{label}</Text>
    </Pressable>
  );
};

// --- Componente Principal: Grupo de Checkboxes ---
interface CheckboxGroupProps {
  title: string;
  options: string[];
  selectedOptions?: string[]; // permite controlar la selección desde el componente padre
  onSelectionChange: (selected: string[]) => void;
  disabled?: boolean;
}

export const CheckboxGroup = ({ title, options, onSelectionChange, selectedOptions: controlledSelected, disabled = false }: CheckboxGroupProps) => {
  const selectedOptions = controlledSelected || [];

  const handleToggle = (option: string) => {
    if (disabled) return;
    const newSelection = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option];
    onSelectionChange(newSelection);
  };

  return (
    <View style={styles.groupContainer}>
      <Text style={styles.groupTitle}>{title}</Text>
      {options.map((option) => (
        <Checkbox
          key={option}
          label={option}
          isChecked={selectedOptions.includes(option)}
          onPress={() => handleToggle(option)}
          disabled={disabled}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  groupContainer: {
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxBase: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007bff',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#007bff',
  },
  checkboxDisabled: {
    borderColor: '#bbb',
    backgroundColor: '#e9ecef',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  checkboxLabelDisabled: {
    color: '#888',
  },
  disabled: {
    opacity: 0.6,
  },
});
