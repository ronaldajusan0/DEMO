// Email sender abstraction so the demo runs without a real provider, and so
// tests can inject a fake and assert on what was sent.
export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
}

export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}

// Default demo sender: never logs PII (no address/name/subject body). It only
// notes that a message was dispatched, satisfying the no-PII-in-logs rule.
export const consoleEmailSender: EmailSender = {
  async send(_message: EmailMessage): Promise<void> {
    // Intentionally logs nothing about the recipient or contents.
    console.info("[email] confirmation dispatched");
  },
};
