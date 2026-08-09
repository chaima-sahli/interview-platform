import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 bg-cream p-8 overflow-y-auto">{children}</main>
    </div>
  );
};

export default Layout;