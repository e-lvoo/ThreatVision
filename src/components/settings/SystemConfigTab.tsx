import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Network, Database, Cpu, Info, Trash2, AlertTriangle, Check, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { NetworkConfig, DatabaseConfig, PerformanceConfig } from '@/types/settings';
import { availableInterfaces } from '@/data/settingsData';
import { cn } from '@/lib/utils';

interface SystemConfigTabProps {
  networkConfig: NetworkConfig;
  databaseConfig: DatabaseConfig;
  performanceConfig: PerformanceConfig;
  onNetworkChange: (config: NetworkConfig) => void;
  onDatabaseChange: (config: DatabaseConfig) => void;
  onPerformanceChange: (config: PerformanceConfig) => void;
}

const SystemConfigTab = ({
  networkConfig,
  databaseConfig,
  performanceConfig,
  onNetworkChange,
  onDatabaseChange,
  onPerformanceChange,
}: SystemConfigTabProps) => {
  const [localNetwork, setLocalNetwork] = useState(networkConfig);
  const [localDatabase, setLocalDatabase] = useState(databaseConfig);
  const [localPerformance, setLocalPerformance] = useState(performanceConfig);
  const [cleanupConfirm, setCleanupConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleNetworkChange = <K extends keyof NetworkConfig>(key: K, value: NetworkConfig[K]) => {
    setLocalNetwork(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleDatabaseChange = <K extends keyof DatabaseConfig>(key: K, value: DatabaseConfig[K]) => {
    setLocalDatabase(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handlePerformanceChange = <K extends keyof PerformanceConfig>(key: K, value: PerformanceConfig[K]) => {
    setLocalPerformance(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveAll = () => {
    onNetworkChange(localNetwork);
    onDatabaseChange(localDatabase);
    onPerformanceChange(localPerformance);
    setHasChanges(false);
    toast({ title: 'Settings Saved', description: 'System configuration updated successfully.' });
  };

  const handleCleanup = () => {
    toast({ title: 'Cleanup Started', description: 'Old data is being archived and removed...' });
    setCleanupConfirm(false);
    // Simulate cleanup
    setTimeout(() => {
      setLocalDatabase(prev => ({ ...prev, usedSpace: prev.usedSpace * 0.6 }));
      toast({ title: 'Cleanup Complete', description: 'Successfully freed up storage space.' });
    }, 2000);
  };

  const toggleInterface = (iface: string) => {
    const newInterfaces = localNetwork.interfaces.includes(iface)
      ? localNetwork.interfaces.filter(i => i !== iface)
      : [...localNetwork.interfaces, iface];
    handleNetworkChange('interfaces', newInterfaces);
  };

  const usagePercentage = (localDatabase.usedSpace / localDatabase.totalSpace) * 100;

  return (
    <div className="space-y-6">
      {/* Save Banner */}
      {hasChanges && (
        <div className="flex items-center justify-between p-4 rounded-lg bg-primary/10 border border-primary/30 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            <span className="text-sm">You have unsaved changes</span>
          </div>
          <Button onClick={handleSaveAll}>Save All Changes</Button>
        </div>
      )}

      {/* Network Settings */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5 text-blue-400" />
            Network Settings
          </CardTitle>
          <CardDescription>Configure network monitoring parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Network Interfaces to Monitor</Label>
            <div className="flex flex-wrap gap-2">
              {availableInterfaces.map((iface) => (
                <Button
                  key={iface}
                  variant={localNetwork.interfaces.includes(iface) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleInterface(iface)}
                  className={cn(
                    'font-mono',
                    localNetwork.interfaces.includes(iface) && 'bg-primary/80'
                  )}
                >
                  {iface}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="flex items-center gap-2">
                Traffic Sampling Rate
                <Tooltip>
                  <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent>Percentage of traffic to analyze (higher = more CPU)</TooltipContent>
                </Tooltip>
              </Label>
              <span className="text-sm font-medium text-primary">{localNetwork.samplingRate}%</span>
            </div>
            <Slider
              value={[localNetwork.samplingRate]}
              onValueChange={([v]) => handleNetworkChange('samplingRate', v)}
              max={100}
              min={1}
              step={1}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="queueSize">Maximum Queue Size</Label>
              <Input
                id="queueSize"
                type="number"
                value={localNetwork.maxQueueSize}
                onChange={(e) => handleNetworkChange('maxQueueSize', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bufferTimeout">Buffer Timeout (seconds)</Label>
              <Input
                id="bufferTimeout"
                type="number"
                value={localNetwork.bufferTimeout}
                onChange={(e) => handleNetworkChange('bufferTimeout', parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Settings */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-green-400" />
            Database Settings
          </CardTitle>
          <CardDescription>Manage data retention and storage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Keep Alerts For</Label>
              <Select
                value={localDatabase.alertRetentionDays.toString()}
                onValueChange={(v) => handleDatabaseChange('alertRetentionDays', parseInt(v))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Keep Detection History For</Label>
              <Select
                value={localDatabase.historyRetentionDays.toString()}
                onValueChange={(v) => handleDatabaseChange('historyRetentionDays', parseInt(v))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
            <div>
              <Label>Auto-Archive Old Data</Label>
              <p className="text-xs text-muted-foreground">Automatically archive data older than retention period</p>
            </div>
            <Switch
              checked={localDatabase.autoArchive}
              onCheckedChange={(v) => handleDatabaseChange('autoArchive', v)}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Database Storage</Label>
              <span className="text-sm text-muted-foreground">
                {localDatabase.usedSpace.toFixed(1)} GB / {localDatabase.totalSpace} GB
              </span>
            </div>
            <Progress 
              value={usagePercentage} 
              className={cn(
                'h-3',
                usagePercentage > 80 && '[&>div]:bg-red-500',
                usagePercentage > 60 && usagePercentage <= 80 && '[&>div]:bg-yellow-500'
              )} 
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                {usagePercentage > 80 ? '⚠️ Storage is running low' : `${(100 - usagePercentage).toFixed(0)}% free`}
              </p>
              <Button variant="outline" size="sm" onClick={() => setCleanupConfirm(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clean Up Old Data
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Settings */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-purple-400" />
            Performance Settings
          </CardTitle>
          <CardDescription>Configure inference and processing options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Max Concurrent Inferences</Label>
              <span className="text-sm font-medium text-primary">{localPerformance.maxConcurrentInferences}</span>
            </div>
            <Slider
              value={[localPerformance.maxConcurrentInferences]}
              onValueChange={([v]) => handlePerformanceChange('maxConcurrentInferences', v)}
              max={100}
              min={1}
              step={1}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Batch Size for Inference</Label>
              <span className="text-sm font-medium text-primary">{localPerformance.batchSize}</span>
            </div>
            <Slider
              value={[localPerformance.batchSize]}
              onValueChange={([v]) => handlePerformanceChange('batchSize', v)}
              max={128}
              min={16}
              step={16}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-green-400" />
                <Label>Use GPU Acceleration</Label>
              </div>
              <Switch
                checked={localPerformance.useGPU}
                onCheckedChange={(v) => handlePerformanceChange('useGPU', v)}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30">
              <div>
                <Label>Real-time Processing</Label>
              </div>
              <Switch
                checked={localPerformance.realtimeProcessing}
                onCheckedChange={(v) => handlePerformanceChange('realtimeProcessing', v)}
              />
            </div>
          </div>

          {localPerformance.useGPU && (
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400">GPU detected: NVIDIA RTX 4090 (24GB VRAM)</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cleanup Confirmation */}
      <AlertDialog open={cleanupConfirm} onOpenChange={setCleanupConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clean Up Old Data</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete data older than your retention settings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCleanup}>Clean Up</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SystemConfigTab;
