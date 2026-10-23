import { useT } from '@/shared/i18n';
import { Badge, type BadgeTone } from '@/shared/ui';

import type { ContentStatus } from '../types';

const STATUS_TONE: Record<ContentStatus, BadgeTone> = {
  pending: 'gold',
  published: 'success',
  hidden: 'muted',
  rejected: 'danger',
};

export function StatusBadge({ status }: { status: ContentStatus }) {
  const t = useT();

  return <Badge label={t.admin.status[status]} tone={STATUS_TONE[status]} />;
}
