import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Plus, Edit, UserX, Trash2, Check, X, Shield, Eye, Users, Loader } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { SystemUser, UserPermissions } from '@/types/settings';
import { rolePermissionsMatrix } from '@/data/settingsData';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { createUserFn, updateUserFn, deleteUserFn, getUsersFn } from '@/lib/functionsClient';

interface UserManagementTabProps {
  users: SystemUser[];
  onUsersChange: (users: SystemUser[]) => void;
}

const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(20),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['admin', 'analyst', 'viewer']),
  permissions: z.object({
    viewAlerts: z.boolean(),
    acknowledgeAlerts: z.boolean(),
    accessSettings: z.boolean(),
    manageUsers: z.boolean(),
  }),
  sendWelcomeEmail: z.boolean(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const roleColors = {
  admin: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  analyst: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  viewer: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

const roleIcons = {
  admin: <Shield className="h-3 w-3" />,
  analyst: <Eye className="h-3 w-3" />,
  viewer: <Users className="h-3 w-3" />,
};

const UserManagementTab = ({ users: initialUsers, onUsersChange }: UserManagementTabProps) => {
  const { user } = useAuth();
  const [users, setUsers] = useState<SystemUser[]>(initialUsers || []);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Fetch users from Supabase on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const fetchedUsers = await getUsersFn();
        setUsers(fetchedUsers);
        if (onUsersChange) {
          onUsersChange(fetchedUsers);
        }
      } catch (error: any) {
        console.error('Error fetching users:', error);
        setLoadError(error.message || 'Failed to load users');
        toast({ 
          title: 'Error Loading Users', 
          description: error.message || 'Failed to load users from server',
          variant: 'destructive' 
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [onUsersChange]);

  if (!user || user.role !== 'admin') {
    return (
      <Card className="glass-card border-border/30">
        <CardHeader>
          <div>
            <CardTitle>Users</CardTitle>
            <CardDescription>Manage system users and their access</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center text-muted-foreground">You are not authorized to view or manage users.</div>
        </CardContent>
      </Card>
    );
  }
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUser, setEditUser] = useState<SystemUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; user: SystemUser | null }>({ isOpen: false, user: null });

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'viewer',
      permissions: {
        viewAlerts: true,
        acknowledgeAlerts: false,
        accessSettings: false,
        manageUsers: false,
      },
      sendWelcomeEmail: true,
    },
  });

  const selectedRole = form.watch('role');

  const getDefaultPermissions = (role: 'admin' | 'analyst' | 'viewer'): UserPermissions => ({
    viewAlerts: rolePermissionsMatrix.viewAlerts[role],
    acknowledgeAlerts: rolePermissionsMatrix.acknowledgeAlerts[role],
    accessSettings: rolePermissionsMatrix.accessSettings[role],
    manageUsers: rolePermissionsMatrix.manageUsers[role],
  });

  const handleRoleChange = (role: 'admin' | 'analyst' | 'viewer') => {
    form.setValue('role', role);
    form.setValue('permissions', getDefaultPermissions(role));
  };

  const handleAddUser = async (data: z.infer<typeof userSchema>) => {
    try {
      // Verify user has a valid session before calling Edge Function
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Your session has expired. Please sign in again.');
      }

      // Convert permissions object to array format expected by Edge Function
      const permissionsArray = [];
      if (data.permissions.viewAlerts) permissionsArray.push('view-alert');
      if (data.permissions.acknowledgeAlerts) permissionsArray.push('acknowledge-alert');
      if (data.permissions.accessSettings) permissionsArray.push('access-settings');
      if (data.permissions.manageUsers) permissionsArray.push('manage-user');

      await createUserFn({
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
        permissions: permissionsArray,
      });
      
      // Refresh users list from server
      const updatedUsers = await getUsersFn();
      setUsers(updatedUsers);
      if (onUsersChange) {
        onUsersChange(updatedUsers);
      }
      
      setIsAddUserOpen(false);
      form.reset();
      toast({ title: 'User Created', description: `${data.username} has been added.` });
    } catch (e: any) {
      toast({ title: 'Create failed', description: e?.message ?? String(e), variant: 'destructive' });
    }
  };

  // Edit user
  const editSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters').max(20),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    confirmPassword: z.string().optional(),
    role: z.enum(['admin', 'analyst', 'viewer']),
    permissions: z.object({
      viewAlerts: z.boolean(),
      acknowledgeAlerts: z.boolean(),
      accessSettings: z.boolean(),
      manageUsers: z.boolean(),
    }),
  }).refine((data) => {
    if (data.password) return data.password === data.confirmPassword;
    return true;
  }, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

  const editForm = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      username: '',
      email: '',
      password: undefined,
      confirmPassword: undefined,
      role: 'viewer',
      permissions: getDefaultPermissions('viewer'),
    },
  });

  const openEditDialog = (user: SystemUser) => {
    setEditUser(user);
    editForm.reset({
      username: user.username,
      email: user.email,
      password: undefined,
      confirmPassword: undefined,
      role: user.role,
      permissions: user.permissions,
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (data: z.infer<typeof editSchema>) => {
    if (!editUser) return;
    try {
      await updateUserFn(editUser.id, data.email, data.password, data.role);
      
      // Refresh users list from server
      const updatedUsers = await getUsersFn();
      setUsers(updatedUsers);
      if (onUsersChange) {
        onUsersChange(updatedUsers);
      }
      
      setIsEditOpen(false);
      setEditUser(null);
      toast({ title: 'User Updated', description: `${data.username} has been updated.` });
    } catch (e: any) {
      toast({ title: 'Update failed', description: e?.message ?? String(e), variant: 'destructive' });
    }
  };

  const handleDeactivateUser = (user: SystemUser) => {
    const newStatus: 'active' | 'inactive' = user.status === 'active' ? 'inactive' : 'active';
    const updated: SystemUser[] = users.map(u => 
      u.id === user.id ? { ...u, status: newStatus } : u
    );
    onUsersChange(updated);
    toast({ 
      title: user.status === 'active' ? 'User Deactivated' : 'User Activated',
      description: `${user.username} has been ${user.status === 'active' ? 'deactivated' : 'activated'}.`
    });
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirm.user) return;
    try {
      await deleteUserFn(deleteConfirm.user.id);
      
      // Refresh users list from server
      const updatedUsers = await getUsersFn();
      setUsers(updatedUsers);
      if (onUsersChange) {
        onUsersChange(updatedUsers);
      }
      
      toast({ title: 'User Deleted', description: `${deleteConfirm.user.username} has been removed.`, variant: 'destructive' });
      setDeleteConfirm({ isOpen: false, user: null });
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e?.message ?? String(e), variant: 'destructive' });
    }
  };

  const permissionLabels = {
    viewAlerts: 'View Alerts',
    acknowledgeAlerts: 'Acknowledge Alerts',
    accessSettings: 'Access Settings',
    manageUsers: 'Manage Users',
  };

  return (
    <div className="space-y-6">
      {/* Users Table */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>Manage system users and their access</CardDescription>
            </div>
            <Button onClick={() => setIsAddUserOpen(true)} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Add New User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading users...</span>
            </div>
          ) : loadError ? (
            <div className="text-center py-8 text-destructive">
              <p>Failed to load users: {loadError}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => {
                  setIsLoading(true);
                  getUsersFn()
                    .then(data => {
                      setUsers(data);
                      setLoadError(null);
                      if (onUsersChange) onUsersChange(data);
                    })
                    .catch(err => setLoadError(err.message))
                    .finally(() => setIsLoading(false));
                }}
              >
                Retry
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} className="border-border/30 hover:bg-muted/30">
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <Badge className={cn('gap-1', roleColors[user.role])}>
                        {roleIcons[user.role]}
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={user.status === 'active' ? 'border-green-500/30 text-green-400' : 'border-muted text-muted-foreground'}>
                        {user.status === 'active' ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{format(user.lastLogin, 'MMM dd, HH:mm')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeactivateUser(user)}>
                          <UserX className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteConfirm({ isOpen: true, user })}
                          disabled={user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Role Permissions Matrix */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle>Role Permissions Matrix</CardTitle>
          <CardDescription>Overview of permissions for each role</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Permission</TableHead>
                <TableHead className="text-center">
                  <Badge className={roleColors.admin}>Admin</Badge>
                </TableHead>
                <TableHead className="text-center">
                  <Badge className={roleColors.analyst}>Analyst</Badge>
                </TableHead>
                <TableHead className="text-center">
                  <Badge className={roleColors.viewer}>Viewer</Badge>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(permissionLabels).map(([key, label]) => (
                <TableRow key={key} className="border-border/30 hover:bg-muted/30">
                  <TableCell className="font-medium">{label}</TableCell>
                  {(['admin', 'analyst', 'viewer'] as const).map((role) => (
                    <TableCell key={role} className="text-center">
                      {(rolePermissionsMatrix as any)[key][role] ? (
                        <Check className="h-5 w-5 text-green-400 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account with specific permissions</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleAddUser)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl><Input placeholder="johndoe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <RadioGroup value={field.value} onValueChange={(v) => handleRoleChange(v as any)} className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="admin" id="admin" />
                        <label htmlFor="admin" className="text-sm cursor-pointer">Admin</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="analyst" id="analyst" />
                        <label htmlFor="analyst" className="text-sm cursor-pointer">Analyst</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="viewer" id="viewer" />
                        <label htmlFor="viewer" className="text-sm cursor-pointer">Viewer</label>
                      </div>
                    </RadioGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Permissions</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(permissionLabels) as (keyof UserPermissions)[]).map((key) => (
                    <FormField
                      key={key}
                      control={form.control}
                      name={`permissions.${key}`}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                              disabled={key === 'manageUsers' && selectedRole !== 'admin'}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">{permissionLabels[key]}</FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="sendWelcomeEmail"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0 p-3 rounded-lg bg-muted/30 border border-border/30">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer">Send welcome email with login instructions</FormLabel>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)}>Cancel</Button>
                <Button type="submit">Create User</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirm.isOpen} onOpenChange={(open) => setDeleteConfirm({ isOpen: open, user: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteConfirm.user?.username}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit User Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details, password (optional), and permissions.</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl><Input placeholder="johndoe" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm</FormLabel>
                      <FormControl><Input type="password" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <RadioGroup value={field.value} onValueChange={(v) => {
                      field.onChange(v);
                      editForm.setValue('permissions', getDefaultPermissions(v as any));
                    }} className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="admin" id="edit-admin" />
                        <label htmlFor="edit-admin" className="text-sm cursor-pointer">Admin</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="analyst" id="edit-analyst" />
                        <label htmlFor="edit-analyst" className="text-sm cursor-pointer">Analyst</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="viewer" id="edit-viewer" />
                        <label htmlFor="edit-viewer" className="text-sm cursor-pointer">Viewer</label>
                      </div>
                    </RadioGroup>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Permissions</FormLabel>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(permissionLabels) as (keyof UserPermissions)[]).map((key) => (
                    <FormField
                      key={key}
                      control={editForm.control}
                      name={`permissions.${key}`}
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Checkbox 
                              checked={field.value} 
                              onCheckedChange={field.onChange}
                              disabled={key === 'manageUsers' && editForm.getValues('role') !== 'admin'}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">{permissionLabels[key]}</FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagementTab;
