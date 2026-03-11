export function calculateStreak(lastStudyDate: number | null, currentStreak: number): { active: boolean, broken: boolean, incremented: boolean, newStreak: number } {
  if (!lastStudyDate) {
    return { active: false, broken: false, incremented: true, newStreak: 1 };
  }

  const now = new Date();
  const lastStudy = new Date(lastStudyDate);

  // Reset time to midnight for accurate day comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastStudyDay = new Date(lastStudy.getFullYear(), lastStudy.getMonth(), lastStudy.getDate());

  const diffTime = Math.abs(today.getTime() - lastStudyDay.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Already studied today
    return { active: true, broken: false, incremented: false, newStreak: currentStreak };
  } else if (diffDays === 1) {
    // Studied yesterday, increment streak
    return { active: true, broken: false, incremented: true, newStreak: currentStreak + 1 };
  } else {
    // Missed a day, streak broken
    return { active: false, broken: true, incremented: true, newStreak: 1 };
  }
}

export function hasStudiedToday(lastStudyDate: number | null): boolean {
  if (!lastStudyDate) return false;
  
  const now = new Date();
  const lastStudy = new Date(lastStudyDate);

  return now.getFullYear() === lastStudy.getFullYear() &&
         now.getMonth() === lastStudy.getMonth() &&
         now.getDate() === lastStudy.getDate();
}
