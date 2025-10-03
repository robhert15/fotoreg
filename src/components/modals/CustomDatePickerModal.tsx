import React, { useState, useMemo } from 'react';
import { Modal, View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';

// --- Props and Constants ---
export interface CustomDatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onDateSelect: (date: Date) => void;
  initialDate?: Date | null;
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// --- Main Component ---
export default function CustomDatePickerModal({
  visible,
  onClose,
  onDateSelect,
  initialDate,
}: CustomDatePickerModalProps) {
  const [step, setStep] = useState<'year' | 'month' | 'day'>('year');
  const [displayYear, setDisplayYear] = useState(initialDate?.getFullYear() ?? new Date().getFullYear());
  const [selectedYear, setSelectedYear] = useState<number | null>(initialDate?.getFullYear() ?? null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(initialDate?.getMonth() ?? null);

  // Reset state when modal becomes visible
  React.useEffect(() => {
    if (visible) {
      const initial = initialDate || new Date();
      setDisplayYear(initial.getFullYear());
      setSelectedYear(initial.getFullYear());
      setSelectedMonth(initial.getMonth());
      setStep('year');
    }
  }, [visible, initialDate]);

  const years = useMemo(() => Array.from({ length: 12 }, (_, i) => displayYear - 6 + i), [displayYear]);

  // --- Handlers ---
  const handleYearSelect = (year: number) => { setSelectedYear(year); setStep('month'); };
  const handleMonthSelect = (month: number) => { setSelectedMonth(month); setStep('day'); };
  const handleDaySelect = (day: number) => {
    if (selectedYear !== null && selectedMonth !== null) {
      onDateSelect(new Date(Date.UTC(selectedYear, selectedMonth, day)));
    }
  };
  const handleBack = () => {
    if (step === 'month') setStep('year');
    else if (step === 'day') setStep('month');
  };

  // --- Render Views ---
  const renderYearView = () => (
    <View style={styles.gridContainer}>
      {years.map((year) => {
        const isSelected = year === selectedYear;
        return (
          <Pressable key={year} onPress={() => handleYearSelect(year)} style={({ pressed }) => [styles.gridButton, isSelected && styles.selectedButton, pressed && styles.pressedButton]}>
            <Text style={[styles.gridText, isSelected && styles.selectedText]}>{year}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderMonthView = () => (
    <View style={styles.gridContainer}>
      {MONTHS.map((month, index) => {
        const isSelected = index === selectedMonth;
        return (
          <Pressable key={month} onPress={() => handleMonthSelect(index)} style={({ pressed }) => [styles.gridButton, isSelected && styles.selectedButton, pressed && styles.pressedButton]}>
            <Text style={[styles.gridText, isSelected && styles.selectedText]}>{month.substring(0, 3)}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderDayView = () => {
    if (selectedYear === null || selectedMonth === null) return null;
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const today = new Date();

    return (
      <View>
        <View style={styles.weekDayRow}>
          {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => <Text key={`${d}-${i}`} style={styles.weekDayText}>{d}</Text>)}
        </View>
        <View style={styles.dayGridContainer}>
          {Array.from({ length: firstDay }).map((_, i) => <View key={`empty-${i}`} style={styles.dayButton} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const isSelected = day === initialDate?.getDate() && selectedMonth === initialDate?.getMonth() && selectedYear === initialDate?.getFullYear();
            const isToday = day === today.getDate() && selectedMonth === today.getMonth() && selectedYear === today.getFullYear();
            return (
              <Pressable key={day} onPress={() => handleDaySelect(day)} style={({ pressed }) => [styles.dayButton, isSelected ? styles.selectedButton : isToday ? styles.todayButton : null, pressed && styles.pressedButton]}>
                <Text style={[styles.dayText, isSelected ? styles.selectedText : isToday ? styles.todayText : null]}>{day}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.container}>
          <LinearGradient colors={['#3B82F6', '#60A5FA']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
            <View style={styles.headerNav}>
              {step !== 'year' && <Pressable onPress={handleBack} style={styles.iconBtn}><Ionicons name="arrow-back" size={22} color="white" /></Pressable>}
            </View>
            <Text style={styles.headerTitle}>{step === 'year' ? displayYear : step === 'month' ? selectedYear : `${MONTHS[selectedMonth ?? 0]} ${selectedYear}`}</Text>
            <View style={styles.headerNav}>
              {step === 'year' && <Pressable onPress={() => setDisplayYear(y => y - 12)} style={styles.iconBtn}><Ionicons name="chevron-back" size={22} color="white" /></Pressable>}
              {step === 'year' && <Pressable onPress={() => setDisplayYear(y => y + 12)} style={styles.iconBtn}><Ionicons name="chevron-forward" size={22} color="white" /></Pressable>}
            </View>
          </LinearGradient>

          <View style={styles.content}>
            {step === 'year' && renderYearView()}
            {step === 'month' && renderMonthView()}
            {step === 'day' && renderDayView()}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  container: { width: '100%', maxWidth: 340, backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 20 },
  header: { padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerNav: { flexDirection: 'row', gap: 10, flex: 1 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center', flex: 2 },
  iconBtn: { padding: 5 },
  content: { padding: 15 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  gridButton: { width: '22%', aspectRatio: 1.6, justifyContent: 'center', alignItems: 'center', borderRadius: 12, backgroundColor: '#F3F4F6' },
  gridText: { color: '#374151', fontWeight: '600' },
  dayGridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  dayButton: { width: `${100/7}%`, aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 99 },
  dayText: { color: '#374151' },
  weekDayRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  weekDayText: { color: '#9CA3AF', fontWeight: 'bold', fontSize: 12 },
  selectedButton: { backgroundColor: Colors.light.primary },
  selectedText: { color: 'white' },
  todayButton: { borderWidth: 1, borderColor: Colors.light.primary },
  todayText: { color: Colors.light.primary, fontWeight: 'bold' },
  pressedButton: { transform: [{ scale: 0.95 }], backgroundColor: '#E5E7EB' },
});
