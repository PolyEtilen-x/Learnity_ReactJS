export interface Pomodoro{
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  lastUpdated?: Date;
}

export function pomodoroFromFirestore(data: any): Pomodoro {
  return {
    workMinutes: data?.workMinutes ?? 25,
    shortBreakMinutes: data?.shortBreakMinutes ?? 5,
    longBreakMinutes: data?.longBreakMinutes ?? 15,
    lastUpdated: data?.lastUpdated?.toDate?.() ?? undefined,
  };
}

export function pomodoroToFirestore(pomodoro: Pomodoro): Record<string, any> {
  return {
    workMinutes: pomodoro.workMinutes,
    shortBreakMinutes: pomodoro.shortBreakMinutes,
    longBreakMinutes: pomodoro.longBreakMinutes,
    lastUpdated: new Date(), // Hoặc dùng `serverTimestamp()` nếu cần (phải import từ Firestore)
  };
}
