import type { Metadata } from 'next';
import DashboardLayout from '@/components/layout/DashboardLayout';
export const metadata: Metadata = { title: "Gastos — D'gikaro" };
export default function L({ children }: { children: React.ReactNode }) { return <DashboardLayout>{children}</DashboardLayout>; }
