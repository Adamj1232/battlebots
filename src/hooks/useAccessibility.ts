import { useSelector } from 'react-redux';
import { RootState } from '../state/store';

export interface AccessibilitySettings {
  colorblindMode: boolean;
  motionReduced: boolean;
  screenReader: boolean;
}

const useAccessibility = () => {
  const { accessibility } = useSelector((state: RootState) => state.game);

  return {
    colorblindMode: accessibility.colorblindMode,
    motionReduced: accessibility.motionReduced,
    screenReader: accessibility.screenReader
  };
};

export default useAccessibility; 