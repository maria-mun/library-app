export function getErrorMessage(error: unknown): string {
  if (
    error instanceof Error &&
    error.message &&
    error.message !== 'Failed to fetch'
  ) {
    return error.message;
  } else {
    return 'Проблема з мережею. Спробуйте пізніше.';
  }
}
