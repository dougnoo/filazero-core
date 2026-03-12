export const formatFileSize = (bytes: number): string => {
  if (bytes <= 0) return "0 Bytes";

  const base = 1024;
  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(base)),
    units.length - 1
  );
  const value = bytes / Math.pow(base, unitIndex);

  return `${parseFloat(value.toFixed(2))} ${units[unitIndex]}`;
};
