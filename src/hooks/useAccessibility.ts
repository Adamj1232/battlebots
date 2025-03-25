import { useState } from 'react';
import { AccessibilitySettings } from '../game/types';

export const useAccessibility = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    colorblindMode: 'none',
    motionReduced: false,
    screenReaderEnabled: false,
    highContrast: false,
    fontSize: 'medium'
  });

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return { settings, updateSettings };
};

export default useAccessibility; 