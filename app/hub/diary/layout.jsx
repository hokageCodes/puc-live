import HubLeaveBridge from '../../../components/hub/HubLeaveBridge';

// Court Diary uses the leave-scoped session (useLeaveAuth). The bridge supplies
// that context from the unified hub session; diary pages derive their own base
// path (/hub/diary vs /diary) from the URL.
export default function HubDiaryLayout({ children }) {
  return <HubLeaveBridge>{children}</HubLeaveBridge>;
}
