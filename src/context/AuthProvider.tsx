'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';
import { RecoilRoot } from 'recoil';

export const AuthProviders = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider>
      <RecoilRoot>{children}</RecoilRoot>
    </SessionProvider>
  );
};