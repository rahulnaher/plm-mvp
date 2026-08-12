import { Navigate, Route, Routes } from 'react-router-dom';
import { App } from './App';
import HubScreen from '../screens/Hub';
import ExplorerScreen from '../screens/Explorer';
import TraceabilityScreen from '../screens/Traceability';
import ImpactScreen from '../screens/Impact';
import CompareScreen from '../screens/Compare';

/**
 * Route table for all 5 screens, mounted inside the persistent App shell.
 * `/` and any unknown path fall back to `/hub` — routing selects which
 * screen renders and nothing else; no screen reads its own state from
 * URL params.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<App />}>
        <Route index element={<Navigate to="/hub" replace />} />
        <Route path="hub" element={<HubScreen />} />
        <Route path="explorer" element={<ExplorerScreen />} />
        <Route path="traceability" element={<TraceabilityScreen />} />
        <Route path="impact" element={<ImpactScreen />} />
        <Route path="compare" element={<CompareScreen />} />
        <Route path="*" element={<Navigate to="/hub" replace />} />
      </Route>
    </Routes>
  );
}
