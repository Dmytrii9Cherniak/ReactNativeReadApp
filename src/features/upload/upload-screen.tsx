import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import type { BookLanguage } from '@/features/catalog';
import { useSubmit } from '@/shared/hooks/use-submit';
import { useT } from '@/shared/i18n';
import { notify } from '@/shared/lib/dialogs';
import { goBack } from '@/shared/lib/navigation';
import { spacing } from '@/shared/theme';
import { Button, Checkbox, Chip, Screen, Text, TextField } from '@/shared/ui';

import { FilePickerField } from './components/file-picker-field';
import { BOOK_FILE_TYPES, COVER_FILE_TYPES, pickFile } from './lib/pick-file';
import { uploadApi } from './upload.api';

import type { BookFile } from './types';

const BOOK_LANGUAGES: readonly BookLanguage[] = ['uk', 'en'];

/** Макет, екран 7. Книга йде в чергу модерації, у бібліотеці — після схвалення. */
export function UploadScreen() {
  const t = useT();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState<BookLanguage>('uk');
  const [file, setFile] = useState<BookFile | null>(null);
  const [cover, setCover] = useState<BookFile | null>(null);
  const [hasRights, setHasRights] = useState(false);
  const { submit, isSubmitting, error, setError } = useSubmit(async (bookFile: BookFile) => {
    await uploadApi.submitBook({ title, author, description, language, file: bookFile, cover });
    notify.success(t.upload.submitted);
    goBack();
  });

  const handleSubmit = () => {
    const invalid = !title.trim()
      ? t.upload.titleRequired
      : !author.trim()
        ? t.upload.authorRequired
        : !file
          ? t.upload.fileRequired
          : !hasRights
            ? t.upload.rightsRequired
            : null;

    if (invalid || !file) {
      setError(invalid);

      return;
    }

    void submit(file);
  };

  const choose = async (types: string[], onPicked: (picked: BookFile) => void) => {
    try {
      const picked = await pickFile(types);

      if (picked) {
        onPicked(picked);
      }
    } catch {
      // Системний вибір файлу недоступний / відмовив
      notify.error(t.errors.unknown);
    }
  };

  return (
    <Screen gap={spacing.md}>
      <Text variant="caption">{t.upload.hint}</Text>
      <TextField value={title} onChangeText={setTitle} placeholder={t.upload.bookTitle} />
      <TextField value={author} onChangeText={setAuthor} placeholder={t.upload.author} />
      <TextField
        value={description}
        onChangeText={setDescription}
        placeholder={t.upload.description}
        multiline
      />
      <View style={styles.language}>
        <Text variant="caption">{t.upload.language}</Text>
        <View style={styles.chips}>
          {BOOK_LANGUAGES.map((item) => (
            <Chip
              key={item}
              label={t.languages[item]}
              selected={item === language}
              onPress={() => setLanguage(item)}
            />
          ))}
        </View>
      </View>
      <FilePickerField
        icon="book"
        label={t.upload.pickFile}
        fileName={file?.name ?? null}
        onPress={() => void choose(BOOK_FILE_TYPES, setFile)}
      />
      <FilePickerField
        icon="image"
        label={t.upload.pickCover}
        fileName={cover?.name ?? null}
        onPress={() => void choose(COVER_FILE_TYPES, setCover)}
      />
      <Checkbox checked={hasRights} onChange={setHasRights} label={t.upload.rights} />
      {error ? (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      ) : null}
      <Button title={t.upload.submit} loading={isSubmitting} onPress={handleSubmit} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  language: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chips: { flexDirection: 'row', gap: spacing.sm },
});
