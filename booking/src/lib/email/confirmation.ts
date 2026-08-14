// Booking confirmation email: pure builder + a send helper over an injectable
// EmailSender.
import type { EmailSender, EmailMessage } from "./sender";

export interface ConfirmationData {
  to: string;
  customerName: string;
  serviceName: string;
  startAt: Date;
  endAt: Date;
}

export function buildConfirmationEmail(data: ConfirmationData): EmailMessage {
  const when = data.startAt.toISOString();
  return {
    to: data.to,
    subject: `Booking confirmed: ${data.serviceName}`,
    body:
      `Hi ${data.customerName},\n\n` +
      `Your booking for "${data.serviceName}" is confirmed for ${when}.\n` +
      `Ends at ${data.endAt.toISOString()}.\n\n` +
      `You can cancel up to 24 hours before the start time.\n`,
  };
}

export async function sendBookingConfirmation(
  sender: EmailSender,
  data: ConfirmationData,
): Promise<EmailMessage> {
  const message = buildConfirmationEmail(data);
  await sender.send(message);
  return message;
}
