import { Stack } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BookCover, type BookLanguage } from '@/features/catalog';
import { formatRelativeTime, useT } from '@/shared/i18n';
import { confirm } from '@/shared/lib/dialogs';
import { goBack } from '@/shared/lib/navigation';
import { spacing } from '@/shared/theme';
import { Button, Card, CenteredMessage, Chip, Loader, Screen, Text, TextField } from '@/shared/ui';

import { adminApi } from './admin.api';
import { ReasonDialog } from './components/reason-dialog';
import { StatusBadge } from './components/status-badge';
import { useAdminAction } from './lib/use-admin-action';
import { useAdminQuery } from './lib/use-admin-query';

import type { AdminBookDetails } from './types';

const LANGUAGES: readonly BookLanguage[] = ['uk', 'en'];
const COVER_WIDTH = 96;

/** Картка книги: перегляд тексту, редагування, схвалення / відхилення з причиною, приховування. */
export function AdminBookScreen({ bookId }: { bookId: string }) {
  const t = useT();
  const { state, refresh } = useAdminQuery(`admin-book:${bookId}`, () => adminApi.getBook(bookId));

  if (state.status === 'loading') {
    return <Loader />;
  }

  if (state.status === 'error') {
    return <CenteredMessage title={t.book.notFound} />;
  }

  return <BookDetails book={state.value} onChanged={refresh} />;
}

function BookDetails({ book, onChanged }: { book: AdminBookDetails; onChanged: () => void }) {
  const t = useT();
  const { run, isRunning } = useAdminAction(onChanged);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [description, setDescription] = useState(book.description);
  const [language, setLanguage] = useState<BookLanguage>(book.language);

  const save = async () => {
    const isSaved = await run(
      () => adminApi.updateBook(book.id, { title, author, description, language }),
      t.admin.done.saved,
    );

    if (isSaved) {
      setIsEditing(false);
    }
  };

  const remove = async () => {
    const isConfirmed = await confirm({
      title: t.admin.confirmDelete(book.title),
      message: t.admin.deleteHint,
      confirmText: t.admin.remove,
      destructive: true,
    });

    if (isConfirmed && (await run(() => adminApi.deleteBook(book.id), t.admin.done.deleted))) {
      goBack();
    }
  };

  const meta = [
    t.languages[book.language],
    book.format.toUpperCase(),
    book.submittedBy?.nickname,
    formatRelativeTime(t, book.submittedAt),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <Stack.Screen options={{ title: book.title }} />
      <Screen gap={spacing.lg}>
        <View style={styles.hero}>
          <BookCover book={book} width={COVER_WIDTH} />
          <View style={styles.heroText}>
            <Text variant="display">{book.title}</Text>
            <Text variant="body">{book.author}</Text>
            <Text variant="caption">{meta}</Text>
            <StatusBadge status={book.status} />
          </View>
        </View>

        {book.rejectReason ? (
          <Text variant="caption" color="danger">
            {t.admin.rejectedBecause(book.rejectReason)}
          </Text>
        ) : null}

        <View style={styles.actions}>
          {book.status === 'pending' || book.status === 'rejected' ? (
            <Button
              variant="success"
              icon="check"
              title={t.admin.approve}
              loading={isRunning}
              onPress={() => void run(() => adminApi.approveBook(book.id), t.admin.done.approved)}
            />
          ) : null}
          {book.status === 'pending' ? (
            <Button
              variant="danger"
              icon="x"
              title={t.admin.reject}
              onPress={() => setIsRejecting(true)}
            />
          ) : null}
          {book.status === 'published' ? (
            <Button
              variant="outline"
              icon="eye-off"
              title={t.admin.hide}
              onPress={() =>
                void run(() => adminApi.setBookHidden(book.id, true), t.admin.done.hidden)
              }
            />
          ) : null}
          {book.status === 'hidden' ? (
            <Button
              variant="outline"
              icon="eye"
              title={t.admin.restore}
              onPress={() =>
                void run(() => adminApi.setBookHidden(book.id, false), t.admin.done.restored)
              }
            />
          ) : null}
          <Button
            variant="outline"
            icon="edit-2"
            title={t.admin.edit}
            onPress={() => setIsEditing((value) => !value)}
          />
          <Button
            variant="danger"
            icon="trash-2"
            title={t.admin.remove}
            onPress={() => void remove()}
          />
        </View>

        {isEditing ? (
          <Card>
            <TextField value={title} onChangeText={setTitle} placeholder={t.upload.bookTitle} />
            <TextField value={author} onChangeText={setAuthor} placeholder={t.upload.author} />
            <TextField
              value={description}
              onChangeText={setDescription}
              placeholder={t.upload.description}
              multiline
            />
            <View style={styles.chips}>
              {LANGUAGES.map((item) => (
                <Chip
                  key={item}
                  label={t.languages[item]}
                  selected={item === language}
                  onPress={() => setLanguage(item)}
                />
              ))}
            </View>
            <Button title={t.admin.save} loading={isRunning} onPress={() => void save()} />
          </Card>
        ) : (
          <Text variant="body" color="text">
            {book.description}
          </Text>
        )}

        <Card>
          <Text variant="sectionLabel">{t.admin.excerpt}</Text>
          {book.excerpt.map((paragraph, index) => (
            <Text key={index} variant="reading">
              {paragraph}
            </Text>
          ))}
        </Card>
      </Screen>

      <ReasonDialog
        visible={isRejecting}
        title={t.admin.rejectTitle}
        hint={t.admin.rejectHint}
        presets={t.admin.rejectReasons}
        confirmText={t.admin.reject}
        onSubmit={(reason) =>
          run(() => adminApi.rejectBook(book.id, reason), t.admin.done.rejected)
        }
        onClose={() => setIsRejecting(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: 'row', gap: spacing.lg },
  heroText: { flex: 1, gap: spacing.xs },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chips: { flexDirection: 'row', gap: spacing.sm },
});
