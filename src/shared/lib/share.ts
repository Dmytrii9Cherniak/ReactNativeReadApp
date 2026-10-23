import { Platform, Share } from 'react-native';

import { WEB_APP_URL } from '@/shared/constants/links';

import type { ShareContent, ShareResult } from './share.types';

/**
 * iOS / Android: системне меню «Поділитися». Посилання — на web-версію, щоб друг
 * відкрив його без застосунку. Web-версія: share.web.ts
 */
export async function share({ message, path }: ShareContent): Promise<ShareResult> {
  const url = `${WEB_APP_URL}${path}`;
  // iOS додає `url` сам; Android його ігнорує — там посилання йде в тексті
  const result = await Share.share(
    Platform.OS === 'ios' ? { message, url } : { message: `${message}\n${url}` },
  );

  return result.action === Share.dismissedAction ? 'dismissed' : 'shared';
}
