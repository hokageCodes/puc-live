import HubLeaveBridge from '../../../components/hub/HubLeaveBridge';

// Runs inside app/hub/layout (HubShell + HubAuthProvider). The bridge exposes the
// hub session to the existing leave pages via the leave auth context, with
// basePath '/hub/leave' so their navigation stays in the hub.
export default function HubLeaveLayout({ children }) {
  return <HubLeaveBridge>{children}</HubLeaveBridge>;
}
