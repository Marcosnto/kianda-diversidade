CREATE TABLE "therapeutic_contracts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "birth_date" DATE NOT NULL,
    "rg" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "education_level" TEXT NOT NULL,
    "profession" TEXT NOT NULL,
    "ethnicity" TEXT NOT NULL,
    "sexual_orientation" TEXT NOT NULL,
    "pronouns" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "gender_other" TEXT,
    "marital_status" TEXT NOT NULL,
    "has_children" BOOLEAN NOT NULL,
    "children_count" INTEGER,
    "religion" TEXT,
    "has_disability" BOOLEAN NOT NULL,
    "disability_details" TEXT,
    "needs_adaptation" BOOLEAN,
    "spouse" TEXT,
    "emergency_contact_1_name" TEXT NOT NULL,
    "emergency_contact_1_phone" TEXT NOT NULL,
    "emergency_contact_1_relationship" TEXT NOT NULL,
    "emergency_contact_2_name" TEXT NOT NULL,
    "emergency_contact_2_phone" TEXT NOT NULL,
    "emergency_contact_2_relationship" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "therapeutic_contracts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "therapeutic_contracts_user_id_key" ON "therapeutic_contracts"("user_id");

ALTER TABLE "therapeutic_contracts"
ADD CONSTRAINT "therapeutic_contracts_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
