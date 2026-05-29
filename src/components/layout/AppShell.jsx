import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import OfflineBanner from '../ui/OfflineBanner';

export default function AppShell() {
  return (
    <div className="app-frame app-frame--fixed">
      <OfflineBanner />
      <div className="app-shell__content">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
