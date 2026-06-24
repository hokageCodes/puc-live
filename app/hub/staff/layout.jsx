import HubAdminBridge from '../../../components/hub/HubAdminBridge';

// Runs inside app/hub/layout (HubShell + HubAuthProvider). The bridge exposes the
// hub session to the existing admin pages via the admin auth context.
export default function HubStaffLayout({ children }) {
  return <HubAdminBridge>{children}</HubAdminBridge>;
}
