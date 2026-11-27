import "server-only";

import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const region = process.env.AWS_SES_REGION ?? "sa-east-1";

let client: SESClient | null = null;

function getClient() {
  if (!client) {
    client = new SESClient({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
      },
    });
  }

  return client;
}

export function isEmailConfigured() {
  return Boolean(
    process.env.AWS_SES_FROM_EMAIL &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY,
  );
}

type SendEmailParams = {
  to: string[];
  subject: string;
  html: string;
  text: string;
};

/**
 * Envia um e-mail em HTML e texto puro via AWS SES.
 */
export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
  const from = process.env.AWS_SES_FROM_EMAIL;
  if (!from) {
    throw new Error(
      "AWS_SES_FROM_EMAIL não configurado: envio de e-mail indisponível.",
    );
  }

  await getClient().send(
    new SendEmailCommand({
      Source: from,
      Destination: { ToAddresses: to },
      Message: {
        Subject: { Data: subject, Charset: "UTF-8" },
        Body: {
          Text: { Data: text, Charset: "UTF-8" },
          Html: { Data: html, Charset: "UTF-8" },
        },
      },
    }),
  );
}
