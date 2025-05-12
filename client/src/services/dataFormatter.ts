export default function dataFormatter(
  isoString: string | Date | undefined,
): string {
  if (!isoString) return "Дата не указана";

  const date = isoString instanceof Date ? isoString : new Date(isoString);

  // Московское время (UTC+3)
  const mskOffset = 3 * 60 * 60 * 1000;
  const mskDate = new Date(date.getTime() + mskOffset);

  // Форматирование даты
  const day = String(mskDate.getUTCDate()).padStart(2, "0");
  const month = String(mskDate.getUTCMonth() + 1).padStart(2, "0");
  const year = mskDate.getUTCFullYear();
  const hours = String(mskDate.getUTCHours()).padStart(2, "0");
  const minutes = String(mskDate.getUTCMinutes()).padStart(2, "0");

  return `${day}.${month}.${year}, ${hours}:${minutes} MSK`;
}

// Новая функция только для даты (без времени)
export function formatDateOnly(isoString: string | Date | undefined): string {
  if (!isoString) return "Дата не указана";

  const date = isoString instanceof Date ? isoString : new Date(isoString);
  const mskOffset = 3 * 60 * 60 * 1000;
  const mskDate = new Date(date.getTime() + mskOffset);

  const day = String(mskDate.getUTCDate()).padStart(2, "0");
  const month = String(mskDate.getUTCMonth() + 1).padStart(2, "0");
  const year = mskDate.getUTCFullYear();

  return `${day}.${month}.${year}`;
}

export function formatChatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();

  // Московское время (UTC+3)
  const mskOffset = 3 * 60 * 60 * 1000;
  const mskDate = new Date(date.getTime() + mskOffset);
  const mskNow = new Date(now.getTime() + mskOffset);

  // Проверка на "сегодня"
  if (
    mskDate.getUTCDate() === mskNow.getUTCDate() &&
    mskDate.getUTCMonth() === mskNow.getUTCMonth() &&
    mskDate.getUTCFullYear() === mskNow.getUTCFullYear()
  ) {
    return "сегодня";
  }

  // Проверка на "вчера"
  const yesterday = new Date(mskNow);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);

  if (
    mskDate.getUTCDate() === yesterday.getUTCDate() &&
    mskDate.getUTCMonth() === yesterday.getUTCMonth() &&
    mskDate.getUTCFullYear() === yesterday.getUTCFullYear()
  ) {
    return "вчера";
  }

  // Для более старых дат
  const day = String(mskDate.getUTCDate()).padStart(2, "0");
  const month = String(mskDate.getUTCMonth() + 1).padStart(2, "0");
  const year = mskDate.getUTCFullYear();

  return `${day}.${month}.${year}`;
}
