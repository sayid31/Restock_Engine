import { useState } from 'react';
import type { PageView } from './types';
import AppLayout from './components/layout/AppLayout';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('dashboard');
  return <AppLayout currentPage={currentPage} onNavigate={setCurrentPage} />;
}
