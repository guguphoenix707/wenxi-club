export type TransactionalEmailTemplateId = 'email-otp';

export type TransactionalEmail = {
  to: string;
  templateId: TransactionalEmailTemplateId;
  variables: {
    otp: string;
  };
};

export type Mailer = {
  sendTransactionalEmail(message: TransactionalEmail): Promise<void>;
};

export function createLogMailer(
  write: (line: string) => void = (line) => console.info(line),
): Mailer {
  return {
    async sendTransactionalEmail(message) {
      if (process.env.NODE_ENV === 'production') {
        write(`[mail] ${message.templateId} -> ${message.to}`);
        return;
      }
      write(`[mail] ${message.templateId} -> ${message.to} otp=${message.variables.otp}`);
    },
  };
}
