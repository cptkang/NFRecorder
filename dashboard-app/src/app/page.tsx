import dynamic from 'next/dynamic';
import styles from '@/styles/Dashboard.module.css';

const Dashboard = dynamic(() => import('@/components/Dashboard'), {
  ssr: false,
  loading: () => <div className={styles.container}>Loading...</div>
});

export default function Home() {
  return <Dashboard />;
}
