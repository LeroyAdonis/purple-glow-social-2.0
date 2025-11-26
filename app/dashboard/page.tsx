import DashboardClientPage from './client-page';

// Using client-side session check instead of server-side
// This fixes issues with session cookies not being properly read on the server
export default function DashboardPage() {
  return <DashboardClientPage />;
}