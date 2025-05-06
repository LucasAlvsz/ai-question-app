export interface AIProvider {
  generateAnswer: (question: string) => Promise<string>;
}
