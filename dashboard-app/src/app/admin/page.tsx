import dynamic from 'next/dynamic';
import styles from '@/styles/Admin.module.css';

const AdminDashboard = dynamic(() => import('@/components/AdminDashboard'), {
    ssr: false,
    loading: () => <div className={styles.container}>Loading...</div>
});

export default function AdminPage() {
    return <AdminDashboard />;
}
