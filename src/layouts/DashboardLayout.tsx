import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-cyber">
      {/* Background effects */}
      <div className="fixed inset-0 bg-cyber-grid bg-cyber-grid opacity-20 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[150px] pointer-events-none" />
      
      <Sidebar />
      <Header />
      
      <main className="pt-16 min-h-screen relative z-10 transition-all duration-300">
        <div className="pl-64 p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
