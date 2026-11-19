export function allowSessionForStatus(status: string | null | undefined) {
  return status === 'active';
}
