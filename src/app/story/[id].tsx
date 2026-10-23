import { useLocalSearchParams } from 'expo-router';

import { StoryScreen } from '@/features/campfire';

export default function StoryRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <StoryScreen storyId={id} />;
}
