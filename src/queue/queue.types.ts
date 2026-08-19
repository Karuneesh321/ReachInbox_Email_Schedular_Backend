export type EmailJob = { emailId: string };
export const emailJobId = (emailId: string) => `email-${emailId}`;