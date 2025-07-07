// app/admin/layout.js
import AdminLayoutWrapper from '../../components/admin/AdminLayoutWrapper';

export default function AdminLayout({ children }) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}