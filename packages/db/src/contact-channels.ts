import { prisma } from "./prisma";

export const CONTACT_CHANNELS_ID = "main";

export type ContactChannelsInput = {
  youtube?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  threads?: string | null;
  facebook?: string | null;
  whatsapp?: string | null;
  tiktok?: string | null;
  x?: string | null;
};

export async function getContactChannels() {
  return prisma.contactChannels.findUnique({
    where: {
      id: CONTACT_CHANNELS_ID,
    },
  });
}

export async function updateContactChannels(input: ContactChannelsInput) {
  return prisma.contactChannels.upsert({
    where: {
      id: CONTACT_CHANNELS_ID,
    },
    create: {
      id: CONTACT_CHANNELS_ID,
      ...input,
    },
    update: input,
  });
}
