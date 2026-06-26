export const truncateText = (text: string | null | undefined, max = 120): string => {
  if (!text) return '';
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
};
