import { File } from 'expo-file-system';

/** iOS / Android: байти обраного файлу. Web-версія: read-file.web.ts */
export async function readFileBytes(uri: string): Promise<Uint8Array> {
  return new Uint8Array(await new File(uri).arrayBuffer());
}
