/** Людське повідомлення з будь-якої помилки (Error, рядок, невідоме). */
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
