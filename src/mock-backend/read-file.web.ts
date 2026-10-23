/** Web: обраний файл — це blob:-посилання браузера. */
export async function readFileBytes(uri: string): Promise<Uint8Array> {
  const response = await fetch(uri);

  return new Uint8Array(await response.arrayBuffer());
}
