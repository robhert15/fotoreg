import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface RadioGroupProps {
  title: string;
  options: string[];
  selectedValue?: string | null;
  onSelectionChange: (selected: string | null) => void;
  disabled?: boolean;
}

export const RadioGroup = ({ title, options, selectedValue, onSelectionChange, disabled = false }: RadioGroupProps) => {
  return (
    <View style={styles.groupContainer}>
      <Text style={styles.groupTitle}>{title}</Text>
      {options.map((option) => {
        const isSelected = selectedValue === option;
        return (
          <Pressable
            key={option}
            style={[styles.radioButtonContainer, disabled && styles.disabled]}
            onPress={() => !disabled && onSelectionChange(option)}
            disabled={disabled}
          >
            <View style={[styles.radioButton, isSelected && styles.radioButtonSelected, disabled && styles.radioButtonDisabled]}>
              {isSelected && <View style={[styles.radioButtonInner, disabled && styles.radioButtonInnerDisabled]} />}
            </View>
            <Text style={[styles.radioButtonLabel, disabled && styles.radioButtonLabelDisabled]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
} 

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
  radioButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12, // Círculo
    borderWidth: 2,
    borderColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioButtonSelected: {
    // Estilos adicionales para el círculo exterior cuando está seleccionado
  },
  radioButtonDisabled: {
    borderColor: '#bbb',
    backgroundColor: '#e9ecef',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007bff',
  },
  radioButtonInnerDisabled: {
    backgroundColor: '#9fbfe8',
  },
  radioButtonLabel: {
    fontSize: 16,
    color: '#333',
  },
  radioButtonLabelDisabled: {
    color: '#888',
  },
  disabled: {
    opacity: 0.6,
  },
});
