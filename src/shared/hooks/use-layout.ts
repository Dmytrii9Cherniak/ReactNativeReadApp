import { useWindowDimensions } from 'react-native';

import { TABLET_MIN_WIDTH } from '@/shared/constants/layout';

/**
 * Тип розкладки за поточною шириною вікна: оновлюється при повороті екрана
 * і зміні розміру вікна (web, планшет у split view).
 */
export function useLayout() {
  const { width } = useWindowDimensions();

  return { isTablet: width >= TABLET_MIN_WIDTH };
}
