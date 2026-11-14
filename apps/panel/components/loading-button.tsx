"use client";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";

type LoadingButtonProps = ComponentProps<typeof Button> & {
  /** Exibe o spinner e bloqueia o botão. */
  loading?: boolean;
  /** Texto exibido enquanto `loading` é verdadeiro. */
  loadingText?: string;
};

/**
 * Botão padrão do painel com estado de carregamento consistente:
 * mostra spinner, troca o texto e impede cliques duplicados.
 */
export function LoadingButton({
  loading = false,
  loadingText,
  disabled,
  children,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      aria-busy={loading || undefined}
      className={cn(loading && "cursor-progress", className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" />}
      {loading ? (loadingText ?? children) : children}
    </Button>
  );
}
