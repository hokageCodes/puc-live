import DiaryProviders from './DiaryProviders';
import DiaryShell from './DiaryShell';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Court Diary | Paul Usoro & Co.',
  description: 'Team court diary workspace.',
};

export default function DiaryLayout({ children }) {
  return (
    <DiaryProviders>
      <DiaryShell>{children}</DiaryShell>
    </DiaryProviders>
  );
}
