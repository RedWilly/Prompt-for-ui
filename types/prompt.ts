export type PromptStep = {
  id: number;
  title: string;
  description: string;
  content: string;
  isCompleted: boolean;
  isLoading: boolean;
};

export type StepStatus = 'pending' | 'loading' | 'completed' | 'error';
