"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@workspace/ui/components/form";
import { useNewsletter } from "./newsletter";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";
import { Loader2 } from "lucide-react";

export const NewsletterForm = () => {
  const {
		form,
		onSubmit,
		isNewsletterPending,
		hasNewsletterError,
		successMessage,
		errorMessage,
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
									className={cn(
										`h-[24px] w-full border-black bg-white text-black placeholder:text-[12px] placeholder:font-normal placeholder:self-center placeholder:italic placeholder:text-[#AAAAAA]`,
										`md:h-[32px] md:placeholder:text-[16px]`,
									)}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button
					disabled={isNewsletterPending}
					type="submit"
					className={cn(
						`h-[24px] w-[25%] flex-grow-0 rounded-md bg-k-olive-dark text-[12px] font-medium text-k-yellow-light`,
						`md:h-[32px] md:rounded-lg md:text-[19px]`,
					)}
				>
					{isNewsletterPending ? (
						<Loader2 className="w-9 animate-spin" size={40} />
					) : (
						"Assinar"
					)}
				</Button>
			</form>
			{hasNewsletterError && (
				<p className="mt-1 text-[12px] text-k-cinnamon md:text-[14px]">
					{errorMessage}
				</p>
			)}
			{successMessage && (
				<p className="mt-1 text-[12px] text-k-olive-dark md:text-[14px]">
					{successMessage}
				</p>
			)}
		</Form>
	);
};
