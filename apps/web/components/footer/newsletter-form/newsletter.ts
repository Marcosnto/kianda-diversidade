import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { z } from "zod";
import { subscribeAction } from "@/app/newsletter/actions";

const formSchema = z.object({
  email: z.string().email({
    message: "Email inválido",
  }),
});

type NewsletterFormValues = z.infer<typeof formSchema>;

export const useNewsletter = () => {
  const [isPending, startTransition] = useTransition();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: NewsletterFormValues) => {
    setSuccessMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      const result = await subscribeAction(values.email);

      if (!result.ok) {
        setErrorMessage(result.error ?? "Ocorreu um erro na inscrição");
        return;
      }

      setSuccessMessage(
        "Quase lá! Enviamos um e-mail para você confirmar a inscrição.",
      );
      form.reset();
    });
  };

  return {
    form,
    onSubmit,
    isNewsletterPending: isPending,
    isNewsletterSuccess: Boolean(successMessage),
    hasNewsletterError: Boolean(errorMessage),
    successMessage,
    errorMessage,
  };
};
