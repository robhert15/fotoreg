import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  Keyboard,
  Platform,
} from 'react-native';
import { Colors } from '@/constants/theme';

type Step = 'year' | 'month' | 'day';

type Props = {
  value?: string;                         // opcional: valor controlado "dd/mm/aaaa"
  onChange?: (date: string | null) => void; // emite string válido o null si incompleto/erróneo
  label?: string;
  minYear?: number;                        // por defecto 1900
  maxYear?: number;                        // por defecto = año actual
};

export default function BirthDateInput({
  value,
  onChange,
  label = 'Fecha de Nacimiento',
  minYear = 1900,
  maxYear = new Date().getFullYear(),
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value ?? '');
  const [inputError, setInputError] = useState('');

  const [step, setStep] = useState<Step>('year');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const [startYear, setStartYear] = useState(new Date().getFullYear()); // rango de 12
  const inputRef = useRef<TextInput>(null);

  const months = useMemo(
    () => [
      { num: 1, name: 'Enero', short: 'ENE' },
      { num: 2, name: 'Febrero', short: 'FEB' },
      { num: 3, name: 'Marzo', short: 'MAR' },
      { num: 4, name: 'Abril', short: 'ABR' },
      { num: 5, name: 'Mayo', short: 'MAY' },
      { num: 6, name: 'Junio', short: 'JUN' },
      { num: 7, name: 'Julio', short: 'JUL' },
      { num: 8, name: 'Agosto', short: 'AGO' },
      { num: 9, name: 'Septiembre', short: 'SEP' },
      { num: 10, name: 'Octubre', short: 'OCT' },
      { num: 11, name: 'Noviembre', short: 'NOV' },
      { num: 12, name: 'Diciembre', short: 'DIC' },
    ],
    []
  );

  // Sincroniza cuando usan "value" controlado
  useEffect(() => {
    if (typeof value === 'string' && value !== inputValue) {
      setInputValue(value);
      // intenta parsear para pintar selección
      const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (m) {
        const d = parseInt(m[1], 10);
        const mo = parseInt(m[2], 10);
        const y = parseInt(m[3], 10);
        if (isValidDate(d, mo, y, minYear, maxYear)) {
          setSelectedDay(d);
          setSelectedMonth(mo);
          setSelectedYear(y);
          setInputError('');
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Cerrar teclado al abrir el modal
  useEffect(() => {
    if (isOpen) Keyboard.dismiss();
  }, [isOpen]);

  // Rango de años (12)
  const years = useMemo(
    () => Array.from({ length: 12 }, (_, i) => {
      const y = startYear - 11 + i;
      return Math.max(minYear, Math.min(y, maxYear));
    }),
    [startYear, minYear, maxYear]
  );

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate(); // month 1-12
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay(); // 0=Domingo
  };

  const isValidDate = (
    day: number,
    month: number,
    year: number,
    minY: number,
    maxY: number
  ) => {
    if (month < 1 || month > 12) return false;
    if (year < minY || year > maxY) return false;
    const dim = getDaysInMonth(year, month);
    if (day < 1 || day > dim) return false;
    return true;
  };

  const formatMask = (text: string) => {
    // Mantener sólo números
    const numbersOnly = text.replace(/\D/g, '');
    let formatted = '';

    if (numbersOnly.length > 0) {
      formatted = numbersOnly.substring(0, 2);
      if (numbersOnly.length >= 3) {
        formatted += '/' + numbersOnly.substring(2, 4);
      }
      if (numbersOnly.length >= 5) {
        let year = numbersOnly.substring(4, 8);

        // Si son 6 dígitos totales => ddmmyy => autocompletar a 4 dígitos
        if (numbersOnly.length === 6) {
          const twoDigitYear = parseInt(year, 10);
          const currentYear = new Date().getFullYear();
          const currentTwoDigit = currentYear % 100;
          if (twoDigitYear <= currentTwoDigit) {
            year = '20' + year;
          } else {
            year = '19' + year;
          }
        }
        formatted += '/' + year;
      }
    }
    return formatted;
  };

  const validateAndEmit = (formatted: string) => {
    if (formatted.length === 10) {
      const m = formatted.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (!m) {
        setInputError('Formato inválido');
        onChange?.(null);
        return;
      }
      const day = parseInt(m[1], 10);
      const month = parseInt(m[2], 10);
      const year = parseInt(m[3], 10);

      if (!isValidDate(day, month, year, minYear, maxYear)) {
        const withinMonth = month >= 1 && month <= 12;
        const yearOk = year >= minYear && year <= maxYear;
        if (!withinMonth) setInputError('Mes inválido (01-12)');
        else if (!yearOk) setInputError(`Año inválido (${minYear}-${maxYear})` );
        else setInputError(`Día inválido (01-${getDaysInMonth(year, month)})` );
        onChange?.(null);
        return;
      }

      // OK
      setSelectedDay(day);
      setSelectedMonth(month);
      setSelectedYear(year);
      setInputError('');
      onChange?.(formatted);
    } else {
      // incompleto
      onChange?.(null);
      if (formatted.length === 0) setInputError('');
    }
  };

  const handleInputChange = (t: string) => {
    const masked = formatMask(t);
    setInputValue(masked);
    setInputError('');
    validateAndEmit(masked);
  };

  const handleOpenCalendar = () => {
    setIsOpen(true);
    setStep('year');
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep('year');
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setStep('month');
  };

  const handleMonthSelect = (month: number) => {
    setSelectedMonth(month);
    setStep('day');
  };

  const handleDaySelect = (day: number) => {
    if (!selectedMonth || !selectedYear) return;
    setSelectedDay(day);
    const formatted = `${String(day).padStart(2, '0')}/${String(selectedMonth).padStart(2, '0')}/${selectedYear}` ;
    setInputValue(formatted);
    setInputError('');
    onChange?.(formatted);
    setIsOpen(false);
    setStep('year');
  };

  const handleBack = () => {
    if (step === 'month') {
      setSelectedYear(null);
      setStep('year');
    } else if (step === 'day') {
      setSelectedMonth(null);
      setStep('month');
    }
  };

  // Render días
  const renderDays = () => {
    if (!selectedYear || !selectedMonth) return null;
    const dim = getDaysInMonth(selectedYear, selectedMonth);
    const first = getFirstDayOfMonth(selectedYear, selectedMonth);

    const items: Array<{ key: string; day?: number; empty?: boolean; isToday?: boolean }> = [];

    for (let i = 0; i < first; i++) items.push({ key: `empty-${i}` , empty: true });

    for (let d = 1; d <= dim; d++) {
      const now = new Date();
      const isToday =
        d === now.getDate() &&
        selectedMonth === now.getMonth() + 1 &&
        selectedYear === now.getFullYear();

      items.push({ key: `d-${d}` , day: d, isToday });
    }

    return (
      <View style={styles.daysGridContainer}>
        {items.map((item) => {
          if (item.empty) {
            return <View key={item.key} style={styles.dayCell} />;
          }
          return (
            <Pressable
              key={item.key}
              onPress={() => item.day && handleDaySelect(item.day)}
              style={({ pressed }) => [
                styles.dayCell,
                styles.cellBase,
                item.isToday ? styles.dayToday : styles.dayDefault,
                pressed && styles.cellPressed,
              ]}
            >
              <Text style={[styles.dayText, item.isToday ? styles.todayText : styles.defaultText]}>
                {item.day}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ width: '100%', maxWidth: 420, alignSelf: 'center' }}>
        <Text style={styles.label}>{label}</Text>
        <View style={{ position: 'relative' }}>
          <TextInput
            ref={inputRef}
            value={inputValue}
            onChangeText={handleInputChange}
            onFocus={handleOpenCalendar}
            placeholder="dd/mm/aaaa"
            keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
            style={[
              styles.input,
              inputError
                ? styles.inputError
                : inputValue.length === 10 && !inputError
                ? styles.inputValid
                : styles.inputDefault,
            ]}
          />
          <Pressable onPress={handleOpenCalendar} style={styles.calendarBtn} hitSlop={8}>
            <Text style={styles.calendarIcon} accessibilityLabel="Abrir calendario">📅</Text>
          </Pressable>
        </View>

        {!!inputError && <Text style={styles.errorText}>{inputError}</Text>}

        {inputValue.length === 10 && !inputError && (
          <View style={{ marginTop: 6, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 14, color: '#16a34a' }}>✓</Text>
            <Text style={{ fontSize: 12, color: '#16a34a' }}>Fecha válida</Text>
          </View>
        )}
      </View>

      <Modal visible={isOpen} transparent animationType="fade" onRequestClose={handleClose}>
        <Pressable style={styles.backdrop} onPress={handleClose} />

        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerRow}>
              {step !== 'year' && (
                <Pressable onPress={handleBack} style={styles.headerBtn} hitSlop={8}>
                  <Text style={styles.headerBtnText}>←</Text>
                </Pressable>
              )}
              <Text style={styles.headerIcon}>📅</Text>
              <Text style={styles.headerTitle}>Seleccionar Fecha</Text>
              <View style={{ flex: 1 }} />
              <Pressable onPress={handleClose} style={styles.headerBtn} hitSlop={8}>
                <Text style={styles.headerBtnText}>✕</Text>
              </Pressable>
            </View>

            {/* Steps indicator */}
            <View style={styles.stepsRow}>
              <View style={[styles.stepDot, step === 'year' ? styles.stepActive : styles.stepDim]} />
              <View
                style={[
                  styles.stepDot,
                  step === 'month' ? styles.stepActive : selectedYear ? styles.stepDim : styles.stepFaint,
                ]}
              />
              <View
                style={[
                  styles.stepDot,
                  step === 'day' ? styles.stepActive : selectedMonth ? styles.stepDim : styles.stepFaint,
                ]}
              />
            </View>

            {/* Preview */}
            <Text style={styles.previewText}>
              {selectedYear && selectedMonth
                ? `${months[selectedMonth - 1].name} ${selectedYear}` 
                : selectedYear
                ? `Año ${selectedYear}` 
                : 'Selecciona el año'}
            </Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {step === 'year' && (
              <View>
                <View style={styles.yearToolbar}>
                  <Pressable
                    onPress={() => setStartYear((y) => Math.max(minYear, y - 12))}
                    style={styles.toolbarBtn}
                  >
                    <Text style={styles.toolbarBtnText}>← Anterior</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setStartYear(new Date().getFullYear())}
                    style={[styles.toolbarBtn, styles.toolbarBtnPrimary]}
                  >
                    <Text style={[styles.toolbarBtnText, styles.toolbarBtnPrimaryText]}>Año Actual</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setStartYear((y) => Math.min(maxYear, y + 12))}
                    style={styles.toolbarBtn}
                  >
                    <Text style={styles.toolbarBtnText}>Siguiente →</Text>
                  </Pressable>
                </View>

                <Text style={styles.yearRange}>
                  {years[0]} - {years[years.length - 1]}
                </Text>

                <FlatList
                  data={years}
                  numColumns={4}
                  keyExtractor={(y) => String(y)}
                  renderItem={({ item: y }) => (
                    <Pressable
                      onPress={() => handleYearSelect(y)}
                      style={({ pressed }) => [
                        styles.squareCell,
                        styles.cellBase,
                        pressed && styles.cellPressed,
                      ]}
                    >
                      <Text style={styles.squareCellText}>{y}</Text>
                    </Pressable>
                  )}
                  ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                  columnWrapperStyle={{ justifyContent: 'space-between' }}
                  contentContainerStyle={{ gap: 10 }}
                />
              </View>
            )}

            {step === 'month' && (
              <View>
                <Text style={styles.monthYearText}>{selectedYear}</Text>
                <FlatList
                  data={months}
                  numColumns={4}
                  keyExtractor={(m) => String(m.num)}
                  renderItem={({ item: m }) => (
                    <Pressable
                      onPress={() => handleMonthSelect(m.num)}
                      style={({ pressed }) => [
                        styles.squareCell,
                        styles.cellBase,
                        pressed && styles.cellPressed,
                      ]}
                    >
                      <Text style={styles.monthShort}>{m.short}</Text>
                      <Text style={styles.monthNum}>{m.num}</Text>
                    </Pressable>
                  )}
                  ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                  columnWrapperStyle={{ justifyContent: 'space-between' }}
                  contentContainerStyle={{ gap: 10 }}
                />
              </View>
            )}

            {step === 'day' && (
              <View>
                <Text style={styles.monthYearText}>
                  {selectedMonth && months[selectedMonth - 1].name} {selectedYear}
                </Text>

                {/* Días de la semana */}
                <View style={styles.weekHeaderRow}>
                  {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
                    <Text key={i} style={styles.weekHeaderText}>
                      {d}
                    </Text>
                  ))}
                </View>

                {renderDays()}
              </View>
            )}
          </View>

          {/* Footer */}
          <Text style={styles.footerText}>
            {step === 'year' && 'Paso 1 de 3: Selecciona el año'}
            {step === 'month' && 'Paso 2 de 3: Selecciona el mes'}
            {step === 'day' && 'Paso 3 de 3: Selecciona el día'}
          </Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 10,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    paddingRight: 44,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: '500',
    backgroundColor: Colors.light.white,
    borderWidth: 1,
  },
  inputDefault: {
    borderColor: Colors.light.outline,
  },
  inputError: {
    borderColor: Colors.light.warning, // O un rojo específico para errores
  },
  inputValid: {
    borderColor: Colors.light.success,
  },
  calendarBtn: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -18 }],
    padding: 6,
    borderRadius: 8,
  },
  calendarIcon: {
    fontSize: 20,
    color: Colors.light.icon,
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: Colors.light.warning, // O un rojo específico para errores
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalCard: {
    position: 'absolute',
    left: '4%',
    right: '4%',
    top: '15%',
    backgroundColor: Colors.light.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  header: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerBtn: {
    padding: 6,
  },
  headerBtnText: {
    color: Colors.light.white,
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerIcon: {
    fontSize: 18,
  },
  headerTitle: {
    color: Colors.light.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
    marginBottom: 6,
  },
  stepDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  stepActive: { backgroundColor: Colors.light.white },
  stepDim: { backgroundColor: 'rgba(255,255,255,0.5)' },
  stepFaint: { backgroundColor: 'rgba(255,255,255,0.25)' },
  previewText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  yearToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  toolbarBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.outline,
    backgroundColor: Colors.light.background,
  },
  toolbarBtnText: {
    fontSize: 13,
    color: Colors.light.textLight,
    fontWeight: '600',
  },
  toolbarBtnPrimary: {
    borderColor: Colors.light.primary,
    backgroundColor: 'rgba(0, 174, 203, 0.1)', // Tono claro del primario
  },
  toolbarBtnPrimaryText: {
    color: Colors.light.primary,
  },
  yearRange: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.light.textLight,
    marginBottom: 12,
    fontWeight: '500',
  },
  squareCell: {
    width: '22.5%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.borderColor,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.white,
  },
  squareCellText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  monthYearText: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  monthShort: {
    fontSize: 12,
    color: Colors.light.textLight,
    fontWeight: '500',
  },
  monthNum: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  weekHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    color: Colors.light.textLight,
    fontWeight: '600',
  },
  daysGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellBase: {
    borderRadius: 99,
  },
  cellPressed: {
    backgroundColor: Colors.light.borderColor,
  },
  dayDefault: {},
  dayToday: {
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  defaultText: {
    color: Colors.light.text,
  },
  todayText: {
    color: Colors.light.primary,
  },
  footerText: {
    padding: 16,
    paddingTop: 0,
    textAlign: 'center',
    fontSize: 12,
    color: Colors.light.textLight,
  },
});
