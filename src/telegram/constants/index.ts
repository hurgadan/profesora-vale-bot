import * as path from "path";

export enum CallbackData {
  TRIAL_SIGNUP = "trial_signup",
  VIDEO_MEETING = "video_meeting",
  FREE_GUIDE = "free_guide",
  ASK_QUESTION = "ask_question",
}

export const ACTION_LABELS: Record<CallbackData, string> = {
  [CallbackData.TRIAL_SIGNUP]: "Запись на пробный пакет (2 урока)",
  [CallbackData.VIDEO_MEETING]: "Выбор времени для видео знакомства",
  [CallbackData.FREE_GUIDE]: "Запрос бесплатного гайда",
  [CallbackData.ASK_QUESTION]: "Вопрос Валерии",
};

export const FREE_GUIDE_PDF_PATH = path.join(process.cwd(), "assets", "cv.pdf");
