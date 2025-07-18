export function getMultiplier(condition: string): number {
  switch (condition) {
    case 'new':
      return 1;
    case 'as_new':
      return 0.8;
    case 'damaged':
      return 0.5;
    default:
      return 1;
  }
}
