export interface AttemptStartDto {
  attemptId: string;
  examId: string;
  examTitle: string;
  navigationType: string;
  durationMinutes: number;
  durationSeconds: number;
  startedAt: string;
  questions: AttemptQuestionDto[];
}

export interface AttemptQuestionDto {
  attemptQuestionId: string;
  orderIndex: number;
  questionBody: string;
  attachments: AttemptAttachmentDto[];
}

export interface AttemptAttachmentDto {
  filePathUrl: string;
  fileType: string;
  displayOrder: number;
  altText: string;
  languageCode: string;
}

export interface AttemptResumeDto {
  attemptId: string;
  examId: string;
  navigationType: string;
  remainingSeconds: number;
  status: string;
  questions: ResumeQuestionDto[];
}

export interface ResumeQuestionDto {
  attemptQuestionId: string;
  orderIndex: number;
  questionBody: string;
  attachments: AttemptAttachmentDto[];
  savedAnswer: string;
  isFlagged: boolean;
}

export interface AutosaveRequestDto {
  answerText: string;
}

export interface FlagRequestDto {
  isFlagged: boolean;
}

export interface SubmitFinalDto {
  finalAnswers: FinalAnswerSubmission[];
}

export interface FinalAnswerSubmission {
  attemptQuestionId: string;
  answerText: string;
}

export interface AttemptSubmitResultDto {
  attemptId: string;
  status: string;
  score: number | null;
  passed: boolean | null;
  totalTimeSeconds: number | null;
  reportStatus: string;
  reportUrl: string;
  message: string;
}

export interface AttemptSummaryDto {
  attemptId: string;
  candidateId: string;
  candidateName: string;
  score: number | null;
  passed: boolean | null;
  status: string;
  startedAt: string;
  completedAt: string;
}

export interface CandidateAttemptDto {
  attemptId: string;
  examId: string;
  examTitle: string;
  score: number | null;
  passed: boolean | null;
  status: string;
  startedAt: string;
  completedAt: string;
  hasReport: boolean;
}
