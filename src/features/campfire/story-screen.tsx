import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useCurrentUser } from '@/features/auth';
import { useReadingStyle } from '@/features/settings';
import { useAsync } from '@/shared/hooks/use-async';
import { errorText, formatRelativeTime, useT } from '@/shared/i18n';
import { notify } from '@/shared/lib/dialogs';
import { borderWidth, campfireColors, spacing } from '@/shared/theme';
import { CenteredMessage, Loader, Screen, Text } from '@/shared/ui';

import { campfireApi } from './campfire.api';
import { useCampfireStore } from './campfire.store';
import { AuthorLine } from './components/author-line';
import { FireButton } from './components/fire-button';
import { getReadingMinutes } from './lib/reading-time';

import type { Story } from './types';

/** Історія (макет, екран 13). Текст — шрифтом і розміром з налаштувань читання. */
export function StoryScreen({ storyId }: { storyId: string }) {
  const t = useT();
  const state = useAsync(`story:${storyId}`, () => campfireApi.get(storyId));

  if (state.status === 'loading') {
    return (
      <View style={styles.screen}>
        <Loader />
      </View>
    );
  }

  if (state.status === 'error') {
    return <CenteredMessage title={t.errors.not_found} />;
  }

  return <StoryContent initial={state.value} />;
}

function StoryContent({ initial }: { initial: Story }) {
  const t = useT();
  const user = useCurrentUser();
  const fire = useCampfireStore((s) => s.fire);
  // Після вогника беремо версію зі стрічки — так лічильники всюди однакові
  const fromFeed = useCampfireStore((s) => s.stories?.find((item) => item.id === initial.id));
  const [local, setLocal] = useState(initial);
  const story = fromFeed ?? local;
  const readingStyle = useReadingStyle();
  const [isFiring, setIsFiring] = useState(false);

  const isOwn = user?.id === story.author.id;

  const handleFire = async () => {
    if (!user) {
      router.push('/login');

      return;
    }

    setIsFiring(true);

    try {
      if (fromFeed) {
        await fire(story.id);
      } else {
        setLocal(await campfireApi.fire(story.id));
      }
    } catch (error) {
      notify.error(errorText(t, error));
    } finally {
      setIsFiring(false);
    }
  };

  const meta = `${formatRelativeTime(t, story.createdAt)} · ${t.campfire.minutesRead(getReadingMinutes(story.body))}`;

  return (
    <Screen backgroundColor={campfireColors.backgroundStory} gap={spacing.lg}>
      <AuthorLine author={story.author} meta={meta} />
      <Text variant="display" style={styles.title}>
        {story.title}
      </Text>
      {story.body.split('\n\n').map((paragraph, index) => (
        <Text key={index} variant="reading" style={[readingStyle, styles.body]}>
          {paragraph}
        </Text>
      ))}
      <View style={styles.divider} />
      <FireButton
        count={story.fires}
        label={t.campfire.fire(story.fires)}
        isLit={story.firedByMe}
        disabled={isFiring || isOwn || story.firedByMe || story.status !== 'published'}
        onPress={() => void handleFire()}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: campfireColors.backgroundStory },
  title: { color: campfireColors.title },
  body: { color: campfireColors.body },
  divider: { height: borderWidth.hairline, backgroundColor: campfireColors.border },
});
