import { HubAuthProvider } from '../../components/hub/HubAuthContext';
import HubShell from '../../components/hub/HubShell';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'PUC Hub',
  description: 'Paul Usoro & Co. HR Hub — staff self-service and HR management.',
};

export default function HubLayout({ children }) {
  return (
    <HubAuthProvider>
      <HubShell>{children}</HubShell>
    </HubAuthProvider>
  );
}
