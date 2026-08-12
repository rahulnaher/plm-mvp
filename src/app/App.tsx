import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';

/**
 * Top-level layout shell: fixed Sidebar + right column (fixed Header above
 * a scrolling <main>). Only <main> scrolls vertically; nothing here
 * introduces horizontal scroll. Route content renders through <Outlet/>.
 */
export function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-canvas">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-8 py-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
