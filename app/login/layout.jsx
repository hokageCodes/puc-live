import { HubAuthProvider } from '../../components/hub/HubAuthContext';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Sign in | PUC Hub',
  description: 'Sign in to the Paul Usoro & Co. HR Hub.',
};

export default function LoginLayout({ children }) {
  return <HubAuthProvider>{children}</HubAuthProvider>;
}
