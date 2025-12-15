import React from 'react';
import { AppLayout } from './AppLayout';
type LayoutProps = {
  children: React.ReactNode;
};
export const Layout: React.FC<LayoutProps> = ({
  children
}) => {
  return <AppLayout activeSection="forms">{children}</AppLayout>;
};