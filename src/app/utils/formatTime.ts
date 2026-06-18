export const formatTime = (date: Date) => {
  const pad = (num: number) => String(num).padStart(2, '0');

  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};