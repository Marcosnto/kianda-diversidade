"use client";

import { Button } from "@workspace/ui/components/button";

type ErrorProps = {
  reset: () => void;
};

export default function Error({ reset }: ErrorProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold text-k-olive-deep md:text-3xl">
        Não foi possível carregar os artigos.
      </h1>
      <p className="mt-3 text-base leading-7 text-k-olive-dark md:text-lg">
        Tente novamente em instantes.
      </p>
      <Button
        className="mt-8 rounded-lg bg-k-olive-dark px-6 text-k-yellow-light hover:bg-k-olive-deep hover:text-k-yellow-light"
        onClick={reset}
        type="button"
      >
        Tentar novamente
      </Button>
    </div>
  );
}
