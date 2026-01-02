import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Modal, TextInput } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface DatePickerProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'datetime' | 'time';
  minimumDate?: Date;
  maximumDate?: Date;
}

// Format date to YYYY-MM-DD for HTML input
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Format time to HH:MM for HTML input
const formatTimeForInput = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Format datetime-local for HTML input
const formatDateTimeForInput = (date: Date): string => {
  return `${formatDateForInput(date)}T${formatTimeForInput(date)}`;
};

export function DatePicker({
  label,
  value,
  onChange,
  mode = 'date',
  minimumDate,
  maximumDate,
}: DatePickerProps) {
  const [show, setShow] = useState(false);
  const [androidStep, setAndroidStep] = useState<'date' | 'time'>('date');
  const [pendingDate, setPendingDate] = useState<Date | null>(null);
  const inputRef = useRef<TextInput>(null);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'dismissed') {
        setShow(false);
        setAndroidStep('date');
        setPendingDate(null);
        return;
      }

      if (mode === 'datetime') {
        if (androidStep === 'date') {
          if (selectedDate && event.type === 'set') {
            const updated = new Date(selectedDate);
            updated.setHours(value.getHours(), value.getMinutes(), 0, 0);
            setPendingDate(updated);
            setAndroidStep('time');
            setShow(true);
          }
          return;
        }

        if (androidStep === 'time') {
          if (selectedDate && event.type === 'set') {
            const base = pendingDate ?? value;
            const updated = new Date(base);
            updated.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
            onChange(updated);
          }
          setShow(false);
          setAndroidStep('date');
          setPendingDate(null);
          return;
        }
      }

      setShow(false);
      if (selectedDate && event.type === 'set') {
        onChange(selectedDate);
      }
      return;
    }

    if (selectedDate && event.type === 'set') {
      onChange(selectedDate);
    }
  };

  const handleWebChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue) {
      let newDate: Date;
      if (mode === 'time') {
        const [hours, minutes] = newValue.split(':').map(Number);
        newDate = new Date(value);
        newDate.setHours(hours, minutes);
      } else if (mode === 'datetime') {
        newDate = new Date(newValue);
      } else {
        newDate = new Date(newValue + 'T00:00:00');
      }
      if (!isNaN(newDate.getTime())) {
        onChange(newDate);
      }
    }
  };

  const formatDisplay = () => {
    if (mode === 'date') {
      return value.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } else if (mode === 'time') {
      return value.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      return value.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const getInputType = () => {
    if (mode === 'time') return 'time';
    if (mode === 'datetime') return 'datetime-local';
    return 'date';
  };

  const getInputValue = () => {
    if (mode === 'time') return formatTimeForInput(value);
    if (mode === 'datetime') return formatDateTimeForInput(value);
    return formatDateForInput(value);
  };

  // Web implementation using native HTML input
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={styles.webInputContainer}>
          <input
            type={getInputType()}
            value={getInputValue()}
            onChange={handleWebChange as any}
            min={minimumDate ? formatDateForInput(minimumDate) : undefined}
            max={maximumDate ? formatDateForInput(maximumDate) : undefined}
            style={{
              flex: 1,
              fontSize: 16,
              padding: '12px 14px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#1C1C1E',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          setShow(true);
          if (Platform.OS === 'android' && mode === 'datetime') {
            setAndroidStep('date');
            setPendingDate(null);
          }
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>{formatDisplay()}</Text>
        <Text style={styles.icon}>📅</Text>
      </TouchableOpacity>

      {show && Platform.OS === 'ios' && (
        <Modal transparent animationType="fade" visible={show}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={styles.modalCancel}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={styles.modalDone}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={value}
                mode={mode === 'datetime' ? 'datetime' : mode}
                display="spinner"
                onChange={handleChange}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      )}

      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={mode === 'datetime' ? pendingDate ?? value : value}
          mode={mode === 'datetime' ? androidStep : mode}
          display="default"
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3C3C43',
    marginBottom: 6,
  },
  button: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonText: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  icon: {
    fontSize: 18,
  },
  webInputContainer: {
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalCancel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  modalDone: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  picker: {
    height: 200,
  },
});
