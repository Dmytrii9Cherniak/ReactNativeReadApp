import { Text } from '@/shared/ui';

/** Помилка форми під полями. */
export function FormError({ message }: { message: string | null }) {
  return message ? (
    <Text variant="caption" color="danger">
      {message}
    </Text>
  ) : null;
}
