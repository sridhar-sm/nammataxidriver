import { Alert, Platform } from 'react-native';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[]
): void {
  if (Platform.OS === 'web') {
    // Web fallback using window.confirm/alert
    if (!buttons || buttons.length === 0) {
      window.alert(message ? `${title}\n\n${message}` : title);
      return;
    }

    // Find the primary action (non-cancel, non-destructive or last button)
    const cancelButton = buttons.find((b) => b.style === 'cancel');
    const actionButtons = buttons.filter((b) => b.style !== 'cancel');

    if (actionButtons.length === 0) {
      window.alert(message ? `${title}\n\n${message}` : title);
      cancelButton?.onPress?.();
      return;
    }

    if (actionButtons.length === 1) {
      const confirmed = window.confirm(
        message ? `${title}\n\n${message}` : title
      );
      if (confirmed) {
        actionButtons[0].onPress?.();
      } else {
        cancelButton?.onPress?.();
      }
      return;
    }

    // Multiple action buttons - use confirm for the first destructive/primary action
    const destructiveButton = actionButtons.find((b) => b.style === 'destructive');
    const primaryButton = destructiveButton || actionButtons[0];

    const confirmed = window.confirm(
      message
        ? `${title}\n\n${message}\n\nClick OK to ${primaryButton.text}`
        : `${title}\n\nClick OK to ${primaryButton.text}`
    );

    if (confirmed) {
      primaryButton.onPress?.();
    } else {
      cancelButton?.onPress?.();
    }
  } else {
    // Native iOS/Android Alert
    Alert.alert(title, message, buttons);
  }
}

export function showActionSheet(
  title: string,
  message: string | undefined,
  options: AlertButton[]
): void {
  if (Platform.OS === 'web') {
    // On web, show options as a simple prompt
    const optionTexts = options
      .filter((o) => o.style !== 'cancel')
      .map((o, i) => `${i + 1}. ${o.text}`)
      .join('\n');

    const input = window.prompt(
      `${title}${message ? `\n${message}` : ''}\n\nEnter number to select:\n${optionTexts}`
    );

    if (input) {
      const index = parseInt(input) - 1;
      const actionOptions = options.filter((o) => o.style !== 'cancel');
      if (index >= 0 && index < actionOptions.length) {
        actionOptions[index].onPress?.();
      }
    }
  } else {
    Alert.alert(title, message, options);
  }
}
