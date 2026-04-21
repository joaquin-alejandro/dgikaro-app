import DashboardLayout from '@/components/layout/DashboardLayout';
import './shared.css';

export default function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
