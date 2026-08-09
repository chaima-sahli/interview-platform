import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen p-4 md:p-6 flex">
      <div className="flex w-full rounded-xl2 overflow-hidden shadow-xl shadow-charcoal/10 min-h-[calc(100vh-3rem)]">
        <Sidebar />
        <main className="flex-1 bg-cream p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default Layout;