import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { useProgressionStore } from '@/features/progression';
import { useSubmit } from '@/shared/hooks/use-submit';
import { useT } from '@/shared/i18n';
import { notify } from '@/shared/lib/dialogs';
import { goBack } from '@/shared/lib/navigation';
import { campfireColors, spacing } from '@/shared/theme';
import { Button, Screen, Text, TextField } from '@/shared/ui';

import { useCampfireStore } from './campfire.store';

const MIN_BODY_LENGTH = 100;

/** Нова історія: 1 на день, +1 XP. Історії звичайних користувачів спершу перевіряє модератор. */
export function NewStoryScreen() {
  const t = useT();
  const create = useCampfireStore((s) => s.create);
  const loadProgress = useProgressionStore((s) => s.load);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const { submit, isSubmitting, error, setError } = useSubmit(async () => {
    const story = await create({ title, body });

    await loadProgress();
    notify.success(story.status === 'published' ? t.campfire.published : t.campfire.sentForReview);
    goBack();
  });

  const handlePublish = () => {
    if (!title.trim()) {
      setError(t.campfire.titleRequired);

      return;
    }

    if (body.trim().length < MIN_BODY_LENGTH) {
      setError(t.campfire.bodyTooShort);

      return;
    }

    void submit();
  };

  return (
    <Screen backgroundColor={campfireColors.background} gap={spacing.md}>
      <TextField value={title} onChangeText={setTitle} placeholder={t.campfire.storyTitle} />
      <TextField
        value={body}
        onChangeText={setBody}
        placeholder={t.campfire.storyBody}
        multiline
        style={styles.body}
      />
      <Text variant="caption" style={styles.hint}>
        {`${t.campfire.oncePerDay} · ${body.trim().length}`}
      </Text>
      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : null}
      <Button
        variant="ember"
        icon="send"
        title={t.campfire.publish}
        loading={isSubmitting}
        onPress={handlePublish}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { minHeight: 240 },
  hint: { color: campfireColors.textMuted },
});
