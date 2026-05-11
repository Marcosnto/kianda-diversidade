'use client';

import React from 'react';
import { Button } from '@workspace/ui/components/button';
import Link from 'next/link';

export const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4">
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-muted-foreground mb-2">Item não encontrado</h2>
        <p className="text-muted-foreground mb-8">Desculpe, o item que você procura não existe ou foi removido.</p>
        <Link href="/panel/blog/articles">
          <Button>Voltar para Lista</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
