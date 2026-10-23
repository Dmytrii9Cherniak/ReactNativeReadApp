import { useT } from '@/shared/i18n';
import { notify } from '@/shared/lib/dialogs';
import { share } from '@/shared/lib/share';
import type { ShareContent } from '@/shared/lib/share.types';

/** «Поділитися» з повідомленням, якщо посилання лише скопійовано (web без меню поширення). */
export function useShare() {
  const t = useT();

  return async (content: ShareContent) => {
    try {
      if ((await share(content)) === 'copied') {
        notify.success(t.share.copied);
      }
    } catch {
      notify.error(t.errors.unknown);
    }
  };
}
