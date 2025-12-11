"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { useNewsletter } from "./newsletter";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Loader2 } from "lucide-react";

export const NewsletterForm = () => {
  const {
    form,
    onSubmit,
    // isNewsletterSucess,
    // isNewsletterPending,
    // hasNewsletterError,
  } = useNewsletter();

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mb-[1rem] flex w-full justify-between md:mb-0 md:gap-0"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-[70%]">
              <FormControl>
                <Input
                  {...field}
                  placeholder="exemplo@email.com"
                  className="h-[17px] w-full rounded-md border-black bg-white text-black placeholder:text-[10px] placeholder:font-normal placeholder:italic placeholder:text-[#AAAAAA] md:h-[32px] md:rounded-lg md:placeholder:text-[16px] lg:h-12 lg:placeholder:text-[21px] xl:rounded-[17px]"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          // disabled={isNewsletterPending}
          type="submit"
          className="h-[17px] w-[25%] flex-grow-0 rounded-md bg-k-olive-dark text-[12px] font-medium text-k-yellow-light md:h-[31px] md:rounded-lg md:text-[19px] lg:h-12 lg:text-[28.39px] xl:rounded-[17px]"
        >
          Assinar
          {/* {isNewsletterPending && (
            <Loader2 className="w-9 animate-spin" size={40} />
          )} */}
        </Button>
      </form>
      {/* {hasNewsletterError && <p>Ocorreu um erro na inscrição</p>} */}
      {/* {isNewsletterSucess && <p>Assinatura realizada!</p>} */}
    </Form>
  );
};
