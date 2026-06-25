import HubAdminBridge from '../../../components/hub/HubAdminBridge';

// Mounts the blog/news CMS inside the hub. basePath drives in-app navigation so
// the same pages link within /hub/news (public /news preview links stay absolute).
export default function HubNewsLayout({ children }) {
  return <HubAdminBridge basePath="/hub/news">{children}</HubAdminBridge>;
}
