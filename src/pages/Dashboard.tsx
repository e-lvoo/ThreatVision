import { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Target, Activity } from 'lucide-react';
import DashboardLayout from '@/layouts/DashboardLayout';
import KPICard from '@/components/dashboard/KPICard';
import AlertTimelineChart from '@/components/dashboard/AlertTimelineChart';
import AlertsTable from '@/components/dashboard/AlertsTable';
import TopThreatsWidget from '@/components/dashboard/TopThreatsWidget';
import SystemStatusCard from '@/components/dashboard/SystemStatusCard';
import { Skeleton } from '@/components/ui/skeleton';
import { mockKPIData, mockTimelineData, mockAlerts, mockThreatTypes } from '@/data/mockData';
import { Alert } from '@/types/dashboard';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setAlerts(mockAlerts);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleViewDetails = (alert: Alert) => {
    console.log('View details:', alert);
  };

  const handleAcknowledge = (alert: Alert) => {
    setAlerts(prev => 
      prev.map(a => 
        a.id === alert.id ? { ...a, status: 'acknowledged' as const } : a
      )
    );
  };

  const handleThreatClick = (threatName: string) => {
    console.log('Filter by threat:', threatName);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6 animate-fade-in">
          {/* KPI Skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-36 rounded-xl bg-muted/50" />
            ))}
          </div>
          
          {/* Chart Skeleton */}
          <Skeleton className="h-[380px] rounded-xl bg-muted/50" />
          
          {/* Table and Widget Skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-[400px] rounded-xl bg-muted/50 lg:col-span-2" />
            <Skeleton className="h-[400px] rounded-xl bg-muted/50" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">Security Overview</h1>
          <p className="text-muted-foreground">Real-time threat monitoring and analysis</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
            <KPICard
              title="Total Alerts"
              value={mockKPIData.totalAlerts.toLocaleString()}
              icon={AlertTriangle}
              trend={mockKPIData.alertsTrend}
              trendLabel="vs last week"
            />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <KPICard
              title="Active Threats"
              value={mockKPIData.activeThreats}
              icon={Target}
              variant="danger"
              trendLabel="Requiring attention"
            />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <KPICard
              title="Detection Accuracy"
              value={mockKPIData.detectionAccuracy}
              suffix="%"
              icon={Shield}
              variant="success"
              trendLabel="AI model performance"
            />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <SystemStatusCard status={mockKPIData.systemStatus} />
          </div>
        </div>

        {/* Alert Timeline Chart */}
        <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <AlertTimelineChart data={mockTimelineData} />
        </div>

        {/* Recent Alerts Table & Top Threats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <AlertsTable
              alerts={alerts}
              onViewDetails={handleViewDetails}
              onAcknowledge={handleAcknowledge}
            />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <TopThreatsWidget
              data={mockThreatTypes}
              onThreatClick={handleThreatClick}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
