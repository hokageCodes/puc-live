import LeaveProviders from './LeaveProviders';
import LeaveShell from './LeaveShell';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Leave Portal | Paul Usoro & Co.',
  description: 'Secure access to your leave management workspace.',
};

export default function LeaveLayout({ children }) {
  return (
    <LeaveProviders>
      <LeaveShell>{children}</LeaveShell>
    </LeaveProviders>
  );
}

