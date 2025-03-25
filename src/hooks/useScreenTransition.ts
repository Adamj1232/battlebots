import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../state/store';
import { setCurrentScreen, setLoadingProgress } from '../state/slices/gameSlice';

export interface TransitionOptions {
  loadingDuration?: number;
  skipLoading?: boolean;
  onTransitionStart?: () => void;
  onTransitionComplete?: () => void;
}

export const useScreenTransition = () => {
  const dispatch = useDispatch();
  const { currentScreen } = useSelector((state: RootState) => state.game);

  const transitionToScreen = async (
    screen: string,
    options: TransitionOptions = {}
  ) => {
    const {
      loadingDuration = 1000,
      skipLoading = false,
      onTransitionStart,
      onTransitionComplete
    } = options;

    try {
      onTransitionStart?.();

      if (!skipLoading) {
        // Start loading
        dispatch(setLoadingProgress(0));
        dispatch(setCurrentScreen('loading'));

        // Simulate loading progress
        const steps = 10;
        const stepDuration = loadingDuration / steps;
        
        for (let i = 1; i <= steps; i++) {
          await new Promise(resolve => setTimeout(resolve, stepDuration));
          dispatch(setLoadingProgress((i / steps) * 100));
        }
      }

      // Complete transition
      dispatch(setCurrentScreen(screen));
      onTransitionComplete?.();

      return true;
    } catch (error) {
      console.error('Screen transition failed:', error);
      return false;
    }
  };

  return {
    transitionToScreen,
    currentScreen
  };
};

export default useScreenTransition; 