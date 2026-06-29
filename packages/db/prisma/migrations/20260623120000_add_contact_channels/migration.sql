-- CreateTable
CREATE TABLE "contact_channels" (
    "id" TEXT NOT NULL DEFAULT 'main',
    "youtube" TEXT,
    "linkedin" TEXT,
    "instagram" TEXT,
    "threads" TEXT,
    "facebook" TEXT,
    "whatsapp" TEXT,
    "tiktok" TEXT,
    "x" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_channels_pkey" PRIMARY KEY ("id")
);

-- Seed the social link already used by the site.
INSERT INTO "contact_channels" (
    "id",
    "instagram",
    "updated_at"
) VALUES (
    'main',
    'https://www.instagram.com/kiandadiversidade/',
    CURRENT_TIMESTAMP
);
