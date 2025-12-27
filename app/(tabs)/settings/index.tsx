import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { Button, Input, Card } from '../../../src/components/ui';
import { useDriverSettings } from '../../../src/hooks';
import { LoadingSpinner } from '../../../src/components/ui';

export default function SettingsScreen() {
  const { settings, isLoading, saveSettings } = useDriverSettings();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [defaultBata, setDefaultBata] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setName(settings.name || '');
      setPhone(settings.phone || '');
      setDefaultBata(settings.defaultBataPerDay?.toString() || '500');
    }
  }, [settings]);

  const handleSave = async () => {
    const bata = parseFloat(defaultBata) || 500;

    setIsSaving(true);
    try {
      await saveSettings({
        name: name.trim(),
        phone: phone.trim(),
        defaultBataPerDay: bata,
      });
      Alert.alert('Success', 'Settings saved successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Loading settings..." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card title="Driver Details">
        <Input
          label="Driver Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
        />

        <Input
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
        />
      </Card>

      <Card title="Default Values">
        <Input
          label="Default Bata per Day"
          value={defaultBata}
          onChangeText={setDefaultBata}
          keyboardType="numeric"
          placeholder="500"
        />
      </Card>

      <Button
        title="Save Settings"
        onPress={handleSave}
        loading={isSaving}
        style={styles.saveButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    padding: 16,
  },
  saveButton: {
    marginTop: 16,
  },
});
