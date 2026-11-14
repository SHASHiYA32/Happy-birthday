/**
 * A card unlocks at the start of the birthday in the earliest timezone on Earth
 * (UTC+14), so it is never locked on the day for anyone, wherever they live.
 */
export function unlockTime(birthdayDate: string): number {
  return Date.parse(`${birthdayDate}T00:00:00Z`) - 14 * 60 * 60 * 1000;
}

export function isUnlocked(birthdayDate: string, now = Date.now()): boolean {
  return now >= unlockTime(birthdayDate);
}
