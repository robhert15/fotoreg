import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface DatePickerInputProps {
  title: string;
  date: Date | null;
  onDateChange: (newDate: Date) => void;
  disabled?: boolean;
}

export const DatePickerInput = ({ title, date, onDateChange, disabled = false }: DatePickerInputProps) => {
  const [showPicker, setShowPicker] = useState(false);
  const textColor = useThemeColor({}, 'text');
  const textLightColor = useThemeColor({}, 'textLight');
  const outlineColor = useThemeColor({}, 'outline');
  const surfaceColor = useThemeColor({}, 'surface');

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
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <Pressable disabled={disabled} onPress={() => !disabled && setShowPicker(true)}>
        <View
          style={[
            styles.inputBox,
            { borderColor: outlineColor, backgroundColor: surfaceColor },
            disabled && styles.inputBoxDisabled,
          ]}
        >
          <Text style={[styles.dateText, { color: textColor }, disabled && { color: textLightColor }]}>{formattedDate}</Text>
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
  },
  inputBox: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: 'center',
  },
  inputBoxDisabled: {
    opacity: 0.6,
  },
  dateText: {
    fontSize: 16,
  },
});
