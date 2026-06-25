import { redirect } from 'next/navigation';

// The old static launcher (a card grid linking out to separate apps) is superseded
// by the unified Hub. `/hub` now lands on the dashboard inside the authenticated
// shell. The previous launcher remains in git history if ever needed.
export default function HubIndex() {
  redirect('/hub/dashboard');
}
