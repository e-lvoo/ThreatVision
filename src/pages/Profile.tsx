import { useMemo } from 'react';
import { User, ShieldCheck, BarChart2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { mockUsers } from '@/data/settingsData';
import { mockAlertsData } from '@/data/alertsData';
import { formatDistanceToNow } from 'date-fns';

const Profile = () => {
  // Select a default analyst user from mock data
  const user = mockUsers.find(u => u.role === 'analyst') || mockUsers[0];

  const recentAlerts = useMemo(() => {
    return mockAlertsData.slice(0, 6);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <User className="h-6 w-6" />
          Analyst Profile
        </h1>
        <p className="text-muted-foreground mt-1">
          Personal settings and operational preferences for the security analyst.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={`/og-threatvision.svg`} alt={user.username} />
                <AvatarFallback>{user.username?.[0]?.toUpperCase() ?? 'A'}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{user.username}</h2>
                <p className="text-sm text-muted-foreground">
                  {user.role === 'analyst' ? 'Security Analyst' : user.role}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Last login: {formatDistanceToNow(new Date(user.lastLogin), { addSuffix: true })}
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                <Button variant="cyber-outline" size="sm">Edit Profile</Button>
                <Button variant="ghost" size="sm">Message</Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Email</Label>
                <Input value={user.email} readOnly />
              </div>

              <div>
                <Label className="text-xs">Role</Label>
                <Input value={user.role} readOnly />
              </div>

              <div>
                <Label className="text-xs">Organization</Label>
                <Input value="ThreatVision Lab" readOnly />
              </div>

              <div>
                <Label className="text-xs">Account Status</Label>
                <Input value={user.status} readOnly />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">API Key</Label>
                <div className="flex gap-2">
                  <Input value="•••••••••••••••••••" readOnly />
                  <Button variant="outline" size="sm">Reset</Button>
                </div>
              </div>

              <div>
                <Label className="text-xs">Detection Model Access</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model access" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No access</SelectItem>
                    <SelectItem value="read">Read-only</SelectItem>
                    <SelectItem value="full">Full (deploy)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <div className="flex items-center gap-4 w-full">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <div className="text-sm">
                  <div className="font-medium">Permissions</div>
                  <div className="text-muted-foreground text-xs">
                    View and acknowledge alerts
                  </div>
                </div>
              </div>

              <div className="ml-auto">
                <Button variant="cyber">Save Changes</Button>
              </div>
            </div>
          </CardFooter>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detection Preferences</CardTitle>
              <CardDescription>
                Control alerting thresholds and notification preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Minimum severity</div>
                    <div className="text-xs text-muted-foreground">
                      Alerts below this severity will be ignored for notifications
                    </div>
                  </div>
                  <div className="w-40">
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Medium" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">Browser notifications</div>
                    <div className="text-xs text-muted-foreground">
                      Enable desktop alerts for new incidents
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch id="notif" defaultChecked />
                    <Label htmlFor="notif" className="text-sm text-muted-foreground">
                      Enabled
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
              <CardDescription>Recent detections and analyst activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <BarChart2 className="h-10 w-10 text-primary" />
                <div>
                  <div className="text-sm font-medium">Assigned alerts</div>
                  <div className="text-muted-foreground text-xs">
                    {recentAlerts.length} recent alerts
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>Latest alerts observed across the network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {recentAlerts.map(a => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3 rounded-md border border-border bg-muted/30"
              >
                <div>
                  <div className="font-medium">{a.threatType}</div>
                  <div className="text-xs text-muted-foreground">
                    {a.sourceIp} → {a.destinationIp} • {a.protocol}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm">{a.severity.toUpperCase()}</div>
                  <div className="text-xs text-muted-foreground">
                    Confidence: {a.confidenceScore}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
