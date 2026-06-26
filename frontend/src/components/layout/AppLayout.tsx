import type { PageView } from '../../types';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import DashboardPage  from '../dashboard/DashboardPage';
import InventoryPage  from '../inventory/InventoryPage';
import ReportsPage    from '../pages/ReportsPage';
import SettingsPage   from '../pages/SettingsPage';

interface Props {
  currentPage: PageView;
  onNavigate: (p: PageView) => void;
}

export default function AppLayout({ currentPage, onNavigate }: Props) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      <Sidebar currentPage={currentPage} onNavigate={onNavigate} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar currentPage={currentPage} />

        <main className="flex-1 overflow-y-auto p-6">
          {currentPage === 'dashboard' && <DashboardPage />}
          {currentPage === 'inventory' && <InventoryPage />}
          {currentPage === 'reports'   && <ReportsPage  />}
          {currentPage === 'settings'  && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}
