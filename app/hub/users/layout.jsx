import HubAdminBridge from '../../../components/hub/HubAdminBridge';

// Runs inside app/hub/layout (HubShell). Bridges the hub session to the admin
// auth context used by the users/roles page.
export default function HubUsersLayout({ children }) {
  return <HubAdminBridge>{children}</HubAdminBridge>;
}
