import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// import { usePostNewsletter } from "@/api/newsletter";

export const useNewsletter = () => {
  // const {
  //   postNewsLetter,
  //   isNewsletterSucess,
  //   isNewsletterPending,
  //   hasNewsletterError,
  // } = usePostNewsletter();

  const formSchema = z.object({
    email: z.string().email({
      message: "Email inválido",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const { email } = values;

    // postNewsLetter(email);
  };

  return {
    // isNewsletterSucess,
    // isNewsletterPending,
    // hasNewsletterError,
    form,
    onSubmit,
  };
};
