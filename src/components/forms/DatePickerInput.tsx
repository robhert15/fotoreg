import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface DatePickerInputProps {
  title: string;
  date: Date | null;
  onDateChange: (newDate: Date) => void;
  disabled?: boolean;
}

export const DatePickerInput = ({ title, date, onDateChange, disabled = false }: DatePickerInputProps) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // En Android el picker se cierra solo, en iOS no.
    setShowPicker(Platform.OS === 'ios');
    if (disabled) return;
    if (event.type === 'set' && selectedDate) {
      onDateChange(selectedDate);
    }
  };

  const formattedDate = date 
    ? date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Seleccionar fecha...';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Pressable disabled={disabled} onPress={() => !disabled && setShowPicker(true)}>
        <View style={[styles.inputBox, disabled && styles.inputBoxDisabled]}>
          <Text style={[styles.dateText, disabled && styles.dateTextDisabled]}>{formattedDate}</Text>
        </View>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={date || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  inputBox: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  inputBoxDisabled: {
    backgroundColor: '#f7f7f7',
    borderColor: '#ddd',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  dateTextDisabled: {
    color: '#666',
  },
});
