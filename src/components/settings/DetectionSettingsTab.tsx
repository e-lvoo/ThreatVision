import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GripVertical, Plus, Trash2, AlertTriangle, Info, Check, X, Shield, Ban } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/hooks/use-toast';
import { AlertRule, IPListItem, DetectionConfig } from '@/types/settings';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DetectionSettingsTabProps {
  config: DetectionConfig;
  rules: AlertRule[];
  whitelist: IPListItem[];
  blacklist: IPListItem[];
  onConfigChange: (config: DetectionConfig) => void;
  onRulesChange: (rules: AlertRule[]) => void;
  onWhitelistChange: (list: IPListItem[]) => void;
  onBlacklistChange: (list: IPListItem[]) => void;
}

const ruleSchema = z.object({
  name: z.string().min(1, 'Rule name is required').max(50),
  condition: z.enum(['ip', 'threat_type', 'confidence', 'severity', 'port']),
  operator: z.enum(['equals', 'contains', 'greater_than', 'less_than', 'not_equals']),
  value: z.string().min(1, 'Value is required'),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
});

const ipSchema = z.object({
  ip: z.string().regex(/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, 'Invalid IP address'),
  reason: z.string().optional(),
});

const severityColors = {
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const DetectionSettingsTab = ({
  config,
  rules,
  whitelist,
  blacklist,
  onConfigChange,
  onRulesChange,
  onWhitelistChange,
  onBlacklistChange,
}: DetectionSettingsTabProps) => {
  const [localConfig, setLocalConfig] = useState(config);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [newWhitelistIP, setNewWhitelistIP] = useState('');
  const [newBlacklistIP, setNewBlacklistIP] = useState('');
  const [autoBlock, setAutoBlock] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const ruleForm = useForm<z.infer<typeof ruleSchema>>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      name: '',
      condition: 'ip',
      operator: 'equals',
      value: '',
      severity: 'medium',
    },
  });

  const estimatedAlerts = Math.round((100 - localConfig.detectionThreshold) * 12 + (100 - localConfig.confidenceThreshold) * 8);

  const handleThresholdChange = (field: keyof DetectionConfig, value: number) => {
    setLocalConfig(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveConfig = () => {
    onConfigChange(localConfig);
    setHasUnsavedChanges(false);
    toast({ title: 'Settings Saved', description: 'Detection configuration updated successfully.' });
  };

  const handleTestConfig = () => {
    toast({ title: 'Testing Configuration', description: `Running test with ${estimatedAlerts} estimated alerts...` });
  };

  const handleToggleRule = (ruleId: string) => {
    const updated = rules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r);
    onRulesChange(updated);
  };

  const handleDeleteRule = (ruleId: string) => {
    onRulesChange(rules.filter(r => r.id !== ruleId));
    toast({ title: 'Rule Deleted', variant: 'destructive' });
  };

  const handleAddRule = (data: z.infer<typeof ruleSchema>) => {
    const newRule: AlertRule = {
      id: `rule-${Date.now()}`,
      name: data.name,
      condition: data.condition,
      operator: data.operator,
      value: data.value,
      severity: data.severity,
      enabled: true,
      order: rules.length + 1,
    };
    onRulesChange([...rules, newRule]);
    setIsRuleModalOpen(false);
    ruleForm.reset();
    toast({ title: 'Rule Added', description: `"${data.name}" has been created.` });
  };

  const handleAddToWhitelist = () => {
    const result = ipSchema.safeParse({ ip: newWhitelistIP });
    if (!result.success) {
      toast({ title: 'Invalid IP', description: 'Please enter a valid IP address.', variant: 'destructive' });
      return;
    }
    const newItem: IPListItem = {
      id: `wl-${Date.now()}`,
      ip: newWhitelistIP,
      addedBy: 'admin@threatvision.io',
      addedAt: new Date(),
    };
    onWhitelistChange([...whitelist, newItem]);
    setNewWhitelistIP('');
    toast({ title: 'IP Whitelisted', description: `${newWhitelistIP} added to whitelist.` });
  };

  const handleAddToBlacklist = () => {
    const result = ipSchema.safeParse({ ip: newBlacklistIP });
    if (!result.success) {
      toast({ title: 'Invalid IP', description: 'Please enter a valid IP address.', variant: 'destructive' });
      return;
    }
    const newItem: IPListItem = {
      id: `bl-${Date.now()}`,
      ip: newBlacklistIP,
      addedBy: 'admin@threatvision.io',
      addedAt: new Date(),
    };
    onBlacklistChange([...blacklist, newItem]);
    setNewBlacklistIP('');
    toast({ title: 'IP Blacklisted', description: `${newBlacklistIP} added to blacklist.` });
  };

  return (
    <div className="space-y-6">
      {/* Model Configuration */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Model Configuration
            <Tooltip>
              <TooltipTrigger><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
              <TooltipContent>Adjust thresholds to control detection sensitivity</TooltipContent>
            </Tooltip>
          </CardTitle>
          <CardDescription>Configure detection thresholds and sensitivity</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Detection Threshold</Label>
                <span className="text-sm font-medium text-primary">{localConfig.detectionThreshold}%</span>
              </div>
              <Slider
                value={[localConfig.detectionThreshold]}
                onValueChange={([v]) => handleThresholdChange('detectionThreshold', v)}
                max={100}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                Minimum score required to flag traffic as potentially malicious
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Confidence Score Threshold</Label>
                <span className="text-sm font-medium text-primary">{localConfig.confidenceThreshold}%</span>
              </div>
              <Slider
                value={[localConfig.confidenceThreshold]}
                onValueChange={([v]) => handleThresholdChange('confidenceThreshold', v)}
                max={100}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                Minimum model confidence required to generate an alert
              </p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/30 border border-border/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Estimated Alerts</p>
                <p className="text-xs text-muted-foreground">Based on current traffic patterns</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">{estimatedAlerts}</p>
                <p className="text-xs text-muted-foreground">alerts/hour</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleTestConfig}>Test Configuration</Button>
            <Button onClick={handleSaveConfig} disabled={!hasUnsavedChanges}>
              {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
              {!hasUnsavedChanges && <Check className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alert Rules */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alert Rules</CardTitle>
              <CardDescription>Custom rules to filter and prioritize alerts</CardDescription>
            </div>
            <Button onClick={() => setIsRuleModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-8"></TableHead>
                <TableHead>Rule Name</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Enabled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id} className="border-border/30 hover:bg-muted/30">
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  </TableCell>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {rule.condition} {rule.operator.replace('_', ' ')} "{rule.value}"
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(severityColors[rule.severity])}>
                      {rule.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch checked={rule.enabled} onCheckedChange={() => handleToggleRule(rule.id)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteRule(rule.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Whitelist & Blacklist */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Whitelist */}
        <Card className="glass-card border-border/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-400" />
              Whitelist
            </CardTitle>
            <CardDescription>IPs that should never be flagged</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter IP address"
                value={newWhitelistIP}
                onChange={(e) => setNewWhitelistIP(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddToWhitelist()}
              />
              <Button onClick={handleAddToWhitelist}>Add</Button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {whitelist.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/30">
                  <div>
                    <p className="font-mono text-sm">{item.ip}</p>
                    <p className="text-xs text-muted-foreground">{item.reason || 'No reason specified'}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onWhitelistChange(whitelist.filter(w => w.id !== item.id))} className="text-destructive hover:text-destructive">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Blacklist */}
        <Card className="glass-card border-border/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5 text-red-400" />
                  Blacklist
                </CardTitle>
                <CardDescription>IPs that should always be blocked</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="auto-block" className="text-sm">Auto-block</Label>
                <Switch id="auto-block" checked={autoBlock} onCheckedChange={setAutoBlock} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter IP address"
                value={newBlacklistIP}
                onChange={(e) => setNewBlacklistIP(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddToBlacklist()}
              />
              <Button variant="destructive" onClick={handleAddToBlacklist}>Block</Button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {blacklist.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div>
                    <p className="font-mono text-sm">{item.ip}</p>
                    <p className="text-xs text-muted-foreground">{item.reason || 'No reason specified'}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onBlacklistChange(blacklist.filter(b => b.id !== item.id))} className="text-destructive hover:text-destructive">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Rule Modal */}
      <Dialog open={isRuleModalOpen} onOpenChange={setIsRuleModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Alert Rule</DialogTitle>
          </DialogHeader>
          <Form {...ruleForm}>
            <form onSubmit={ruleForm.handleSubmit(handleAddRule)} className="space-y-4">
              <FormField
                control={ruleForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rule Name</FormLabel>
                    <FormControl><Input placeholder="e.g., Block suspicious IPs" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={ruleForm.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="ip">IP Address</SelectItem>
                          <SelectItem value="threat_type">Threat Type</SelectItem>
                          <SelectItem value="confidence">Confidence</SelectItem>
                          <SelectItem value="severity">Severity</SelectItem>
                          <SelectItem value="port">Port</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={ruleForm.control}
                  name="operator"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operator</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="equals">Equals</SelectItem>
                          <SelectItem value="not_equals">Not Equals</SelectItem>
                          <SelectItem value="contains">Contains</SelectItem>
                          <SelectItem value="greater_than">Greater Than</SelectItem>
                          <SelectItem value="less_than">Less Than</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={ruleForm.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl><Input placeholder="Enter value" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={ruleForm.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsRuleModalOpen(false)}>Cancel</Button>
                <Button type="submit">Add Rule</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DetectionSettingsTab;
