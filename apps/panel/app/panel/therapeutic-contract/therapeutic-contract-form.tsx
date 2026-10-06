"use client";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Switch } from "@workspace/ui/components/switch";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  EDUCATION_LEVELS,
  EMERGENCY_RELATIONSHIPS,
  ETHNICITIES,
  GENDERS,
  MARITAL_STATUSES,
  PRONOUNS,
} from "@/lib/therapeutic-contract";
import { saveTherapeuticContractAction } from "./actions";

type TherapeuticContractTextField =
  | "full_name"
  | "birth_date"
  | "rg"
  | "cpf"
  | "email"
  | "contact"
  | "address"
  | "education_level"
  | "profession"
  | "ethnicity"
  | "sexual_orientation"
  | "pronouns"
  | "gender"
  | "gender_other"
  | "marital_status"
  | "children_count"
  | "religion"
  | "disability_details"
  | "spouse"
  | "emergency_contact_1_name"
  | "emergency_contact_1_phone"
  | "emergency_contact_1_relationship"
  | "emergency_contact_2_name"
  | "emergency_contact_2_phone"
  | "emergency_contact_2_relationship";

export type TherapeuticContractDefaults = Record<
  TherapeuticContractTextField,
  string
> & {
  has_children: boolean;
  has_disability: boolean;
  needs_adaptation: boolean;
};

type OptionFieldProps = {
  name: string;
  label: string;
  defaultValue: string;
  options: readonly string[];
  required?: boolean;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
};

function OptionField({
  name,
  label,
  defaultValue,
  options,
  required = true,
  onChange,
}: OptionFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <select
        className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        defaultValue={defaultValue}
        id={name}
        name={name}
        onChange={onChange}
        required={required}
      >
        <option disabled value="">
          Selecione uma opção
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextField({
  name,
  label,
  defaults,
  type = "text",
  required = true,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "defaultValue" | "name"> & {
  name: string;
  label: string;
  defaults: TherapeuticContractDefaults;
  required?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        defaultValue={defaults[name as TherapeuticContractTextField] ?? ""}
        id={name}
        name={name}
        required={required}
        type={type}
        {...props}
      />
    </div>
  );
}

function SwitchField({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex min-h-12 items-center justify-between gap-4 rounded-md border border-input px-3 py-2">
      <Label
        className="cursor-pointer"
        onClick={() => onCheckedChange(!checked)}
      >
        {label}
      </Label>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

export function TherapeuticContractForm({
  defaults,
}: {
  defaults: TherapeuticContractDefaults;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [hasChildren, setHasChildren] = useState(defaults.has_children);
  const [hasDisability, setHasDisability] = useState(defaults.has_disability);
  const [needsAdaptation, setNeedsAdaptation] = useState(
    defaults.needs_adaptation,
  );
  const [gender, setGender] = useState(defaults.gender);
  const [maritalStatus, setMaritalStatus] = useState(defaults.marital_status);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    ) as Record<string, string>;

    startTransition(async () => {
      const result = await saveTherapeuticContractAction({
        ...values,
        has_children: hasChildren,
        has_disability: hasDisability,
        needs_adaptation: needsAdaptation,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Contrato terapêutico salvo com sucesso.");
      router.refresh();
    });
  };

  const isPartnered = ["Casado(a)", "União estável"].includes(maritalStatus);

  return (
    <form className="flex flex-col gap-8" onSubmit={submit}>
      <fieldset className="grid gap-4 sm:grid-cols-2" disabled={isPending}>
        <legend className="mb-2 text-base font-semibold sm:col-span-2">
          Dados pessoais
        </legend>
        <TextField
          className="sm:col-span-2"
          defaults={defaults}
          label="Nome completo"
          name="full_name"
        />
        <TextField
          defaults={defaults}
          label="Data de nascimento"
          name="birth_date"
          type="date"
        />
        <TextField defaults={defaults} label="RG" name="rg" />
        <TextField
          defaults={defaults}
          inputMode="numeric"
          label="CPF"
          maxLength={14}
          name="cpf"
          placeholder="000.000.000-00"
        />
        <TextField
          defaults={defaults}
          label="E-mail"
          name="email"
          type="email"
        />
        <TextField
          defaults={defaults}
          inputMode="tel"
          label="Contato"
          name="contact"
        />
        <TextField
          className="sm:col-span-2"
          defaults={defaults}
          label="Endereço"
          name="address"
        />
        <OptionField
          defaultValue={defaults.education_level}
          label="Nível de escolaridade"
          name="education_level"
          options={EDUCATION_LEVELS}
        />
        <TextField defaults={defaults} label="Profissão" name="profession" />
        <OptionField
          defaultValue={defaults.ethnicity}
          label="Etnia"
          name="ethnicity"
          options={ETHNICITIES}
        />
        <TextField
          defaults={defaults}
          label="Orientação sexual"
          name="sexual_orientation"
        />
        <OptionField
          defaultValue={defaults.pronouns}
          label="Pronomes"
          name="pronouns"
          options={PRONOUNS}
        />
        <div className="grid gap-2">
          <Label htmlFor="gender">Gênero</Label>
          <select
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            defaultValue={gender}
            id="gender"
            name="gender"
            onChange={(event) => setGender(event.target.value)}
            required
          >
            <option disabled value="">
              Selecione uma opção
            </option>
            {GENDERS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        {gender === "Outro" && (
          <TextField
            defaults={defaults}
            label="Especifique o gênero"
            name="gender_other"
          />
        )}
        <div className={gender === "Outro" ? "sm:col-start-2" : ""}>
          <OptionField
            defaultValue={maritalStatus}
            label="Status civil"
            name="marital_status"
            options={MARITAL_STATUSES}
            onChange={(event) => setMaritalStatus(event.target.value)}
          />
        </div>
        {isPartnered && (
          <TextField
            className="sm:col-span-2"
            defaults={defaults}
            label="Nome do cônjuge ou companheiro(a)"
            name="spouse"
          />
        )}
        <TextField
          className="sm:col-span-2"
          defaults={defaults}
          label="Religião"
          name="religion"
          required={false}
        />
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2" disabled={isPending}>
        <legend className="mb-2 text-base font-semibold sm:col-span-2">
          Necessidades de cuidado
        </legend>
        <SwitchField
          checked={hasChildren}
          label="Possui filhos?"
          onCheckedChange={setHasChildren}
        />
        {hasChildren && (
          <TextField
            defaults={defaults}
            inputMode="numeric"
            label="Quantidade de filhos"
            min={1}
            name="children_count"
            type="number"
          />
        )}
        <SwitchField
          checked={hasDisability}
          label="É uma pessoa com deficiência?"
          onCheckedChange={setHasDisability}
        />
        {hasDisability && (
          <>
            <TextField
              defaults={defaults}
              label="Descreva a deficiência"
              name="disability_details"
            />
            <SwitchField
              checked={needsAdaptation}
              label="Precisa de adaptação?"
              onCheckedChange={setNeedsAdaptation}
            />
          </>
        )}
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2" disabled={isPending}>
        <legend className="mb-2 text-base font-semibold sm:col-span-2">
          Primeiro contato de emergência
        </legend>
        <TextField
          defaults={defaults}
          label="Nome completo"
          name="emergency_contact_1_name"
        />
        <TextField
          defaults={defaults}
          inputMode="tel"
          label="Contato"
          name="emergency_contact_1_phone"
        />
        <OptionField
          defaultValue={defaults.emergency_contact_1_relationship}
          label="Parentesco"
          name="emergency_contact_1_relationship"
          options={EMERGENCY_RELATIONSHIPS}
        />
      </fieldset>

      <fieldset className="grid gap-4 sm:grid-cols-2" disabled={isPending}>
        <legend className="mb-2 text-base font-semibold sm:col-span-2">
          Segundo contato de emergência
        </legend>
        <TextField
          defaults={defaults}
          label="Nome completo"
          name="emergency_contact_2_name"
        />
        <TextField
          defaults={defaults}
          inputMode="tel"
          label="Contato"
          name="emergency_contact_2_phone"
        />
        <OptionField
          defaultValue={defaults.emergency_contact_2_relationship}
          label="Parentesco"
          name="emergency_contact_2_relationship"
          options={EMERGENCY_RELATIONSHIPS}
        />
      </fieldset>

      <Button className="w-full sm:w-fit" disabled={isPending} type="submit">
        {isPending ? "Salvando..." : "Salvar contrato terapêutico"}
      </Button>
    </form>
  );
}
