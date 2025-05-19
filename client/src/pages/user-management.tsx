import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import SidebarNav from "@/components/sidebar-nav";
import HeaderNav from "@/components/header-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, UserPlus, MoreVertical, Pencil, UserX, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function UserManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // New user form state
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    phoneNumber: "",
    role: "user",
    paymentMethod: "usdt",
    bankAccountNumber: "",
    bankName: "",
    bankRoutingNumber: "",
    usdtAddress: "",
    status: "active"
  });

  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  // Query to get all users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/users");
      return await response.json();
    },
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await apiRequest("POST", "/api/users", userData);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setCreateDialogOpen(false);
      resetNewUserForm();
      toast({
        title: "User Created",
        description: "The user has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Create User",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/users/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setEditDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: "User Updated",
        description: "The user has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update User",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/users/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: "User Deleted",
        description: "The user has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Delete User",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update user status mutation
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/users/${id}/status`, { status });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Status Updated",
        description: "The user status has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to Update Status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCreateUser = () => {
    // Basic validation
    if (!newUser.username || !newUser.password || !newUser.fullName) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createUserMutation.mutate(newUser);
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;

    updateUserMutation.mutate({
      id: selectedUser.id,
      data: selectedUser,
    });
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;

    deleteUserMutation.mutate(selectedUser.id);
  };

  const handleEditUser = (user: any) => {
    setSelectedUser({ ...user });
    setEditDialogOpen(true);
  };

  const confirmDeleteUser = (user: any) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const updateUserStatus = (id: number, status: string) => {
    updateUserStatusMutation.mutate({ id, status });
  };

  const resetNewUserForm = () => {
    setNewUser({
      username: "",
      password: "",
      fullName: "",
      email: "",
      phoneNumber: "",
      role: "user",
      paymentMethod: "usdt",
      bankAccountNumber: "",
      bankName: "",
      bankRoutingNumber: "",
      usdtAddress: "",
      status: "active"
    });
  };

  const getUserStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "suspended":
        return <Badge className="bg-amber-500">Suspended</Badge>;
      case "pending":
        return <Badge className="bg-blue-500">Pending</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <div className={`${sidebarOpen ? "block" : "hidden"} md:block`}>
        <SidebarNav />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderNav title="User Management" toggleSidebar={toggleSidebar} />

        <div className="flex-1 overflow-auto p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold">User Management</h1>
                <p className="text-muted-foreground mt-1">
                  Manage all your IPRN system users and their permissions
                </p>
              </div>

              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add New User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                      Add a new user to the IPRN management system
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          placeholder="johndoe"
                          value={newUser.username}
                          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          placeholder="John Doe"
                          value={newUser.fullName}
                          onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email (Optional)</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          value={newUser.email || ""}
                          onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number (Optional)</Label>
                        <Input
                          id="phoneNumber"
                          placeholder="+1234567890"
                          value={newUser.phoneNumber || ""}
                          onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select 
                          value={newUser.role}
                          onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                        >
                          <SelectTrigger id="role">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="operator">Operator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select 
                          value={newUser.status}
                          onValueChange={(value) => setNewUser({ ...newUser, status: value })}
                        >
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select 
                        value={newUser.paymentMethod}
                        onValueChange={(value) => setNewUser({ ...newUser, paymentMethod: value })}
                      >
                        <SelectTrigger id="paymentMethod">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usdt">USDT (Crypto)</SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {newUser.paymentMethod === "usdt" && (
                      <div className="space-y-2">
                        <Label htmlFor="usdtAddress">USDT Address (TRC20)</Label>
                        <Input
                          id="usdtAddress"
                          placeholder="TRC20 wallet address"
                          value={newUser.usdtAddress || ""}
                          onChange={(e) => setNewUser({ ...newUser, usdtAddress: e.target.value })}
                        />
                      </div>
                    )}

                    {newUser.paymentMethod === "bank" && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="bankName">Bank Name</Label>
                          <Input
                            id="bankName"
                            placeholder="e.g. Bank of America"
                            value={newUser.bankName || ""}
                            onChange={(e) => setNewUser({ ...newUser, bankName: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="bankAccountNumber">Account Number</Label>
                            <Input
                              id="bankAccountNumber"
                              placeholder="Account number"
                              value={newUser.bankAccountNumber || ""}
                              onChange={(e) => setNewUser({ ...newUser, bankAccountNumber: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bankRoutingNumber">Routing Number</Label>
                            <Input
                              id="bankRoutingNumber"
                              placeholder="Routing number"
                              value={newUser.bankRoutingNumber || ""}
                              onChange={(e) => setNewUser({ ...newUser, bankRoutingNumber: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <DialogFooter className="sm:justify-start">
                    <Button
                      variant="outline"
                      onClick={() => setCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateUser}
                      disabled={createUserMutation.isPending}
                    >
                      {createUserMutation.isPending ? "Creating..." : "Create User"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Tabs defaultValue="all">
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Users</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="suspended">Suspended</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    {isLoading ? (
                      <div className="py-6 flex justify-center">
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    ) : error ? (
                      <div className="py-6 text-center text-red-500">
                        <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                        <p>Failed to load users. Please try again.</p>
                      </div>
                    ) : users?.length === 0 ? (
                      <div className="py-12 text-center">
                        <UserPlus className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-40" />
                        <p className="text-muted-foreground">No users found. Create your first user to get started.</p>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Username</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users?.map((user: any) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.username}</TableCell>
                              <TableCell>{user.fullName}</TableCell>
                              <TableCell className="capitalize">{user.role}</TableCell>
                              <TableCell>{getUserStatusBadge(user.status)}</TableCell>
                              <TableCell className="capitalize">{user.paymentMethod}</TableCell>
                              <TableCell>
                                {user.createdAt && formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      disabled={user.id === (currentUser?.id ?? 0)}
                                      onClick={() => updateUserStatus(user.id, user.status === "active" ? "suspended" : "active")}
                                    >
                                      {user.status === "active" ? (
                                        <>
                                          <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                                          Suspend
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                          Activate
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      disabled={user.id === (currentUser?.id ?? 0)}
                                      onClick={() => confirmDeleteUser(user)}
                                      className="text-red-500"
                                    >
                                      <UserX className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="active" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users?.filter((user: any) => user.status === "active").map((user: any) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.username}</TableCell>
                            <TableCell>{user.fullName}</TableCell>
                            <TableCell className="capitalize">{user.role}</TableCell>
                            <TableCell>{getUserStatusBadge(user.status)}</TableCell>
                            <TableCell className="capitalize">{user.paymentMethod}</TableCell>
                            <TableCell>
                              {user.createdAt && formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    disabled={user.id === (currentUser?.id ?? 0)}
                                    onClick={() => updateUserStatus(user.id, "suspended")}
                                  >
                                    <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                                    Suspend
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    disabled={user.id === (currentUser?.id ?? 0)}
                                    onClick={() => confirmDeleteUser(user)}
                                    className="text-red-500"
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users?.filter((user: any) => user.status === "pending").map((user: any) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.username}</TableCell>
                            <TableCell>{user.fullName}</TableCell>
                            <TableCell className="capitalize">{user.role}</TableCell>
                            <TableCell>{getUserStatusBadge(user.status)}</TableCell>
                            <TableCell className="capitalize">{user.paymentMethod}</TableCell>
                            <TableCell>
                              {user.createdAt && formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => updateUserStatus(user.id, "active")}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                    Activate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => confirmDeleteUser(user)}
                                    className="text-red-500"
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="suspended" className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Username</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users?.filter((user: any) => user.status === "suspended").map((user: any) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.username}</TableCell>
                            <TableCell>{user.fullName}</TableCell>
                            <TableCell className="capitalize">{user.role}</TableCell>
                            <TableCell>{getUserStatusBadge(user.status)}</TableCell>
                            <TableCell className="capitalize">{user.paymentMethod}</TableCell>
                            <TableCell>
                              {user.createdAt && formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                  <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => updateUserStatus(user.id, "active")}
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                    Activate
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => confirmDeleteUser(user)}
                                    className="text-red-500"
                                  >
                                    <UserX className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and settings
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-username">Username</Label>
                  <Input
                    id="edit-username"
                    value={selectedUser.username}
                    onChange={(e) => setSelectedUser({ ...selectedUser, username: e.target.value })}
                    disabled={selectedUser.id === (currentUser?.id ?? 0)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fullName">Full Name</Label>
                  <Input
                    id="edit-fullName"
                    value={selectedUser.fullName}
                    onChange={(e) => setSelectedUser({ ...selectedUser, fullName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-password">New Password (leave empty to keep current)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="••••••••"
                  value={selectedUser.newPassword || ""}
                  onChange={(e) => setSelectedUser({ ...selectedUser, newPassword: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={selectedUser.email || ""}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phoneNumber">Phone Number</Label>
                  <Input
                    id="edit-phoneNumber"
                    value={selectedUser.phoneNumber || ""}
                    onChange={(e) => setSelectedUser({ ...selectedUser, phoneNumber: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select 
                    value={selectedUser.role}
                    onValueChange={(value) => setSelectedUser({ ...selectedUser, role: value })}
                    disabled={selectedUser.id === (currentUser?.id ?? 0)}
                  >
                    <SelectTrigger id="edit-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="operator">Operator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select 
                    value={selectedUser.status}
                    onValueChange={(value) => setSelectedUser({ ...selectedUser, status: value })}
                    disabled={selectedUser.id === (currentUser?.id ?? 0)}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="edit-paymentMethod">Payment Method</Label>
                <Select 
                  value={selectedUser.paymentMethod}
                  onValueChange={(value) => setSelectedUser({ ...selectedUser, paymentMethod: value })}
                >
                  <SelectTrigger id="edit-paymentMethod">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usdt">USDT (Crypto)</SelectItem>
                    <SelectItem value="bank">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedUser.paymentMethod === "usdt" && (
                <div className="space-y-2">
                  <Label htmlFor="edit-usdtAddress">USDT Address (TRC20)</Label>
                  <Input
                    id="edit-usdtAddress"
                    value={selectedUser.usdtAddress || ""}
                    onChange={(e) => setSelectedUser({ ...selectedUser, usdtAddress: e.target.value })}
                  />
                </div>
              )}

              {selectedUser.paymentMethod === "bank" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-bankName">Bank Name</Label>
                    <Input
                      id="edit-bankName"
                      value={selectedUser.bankName || ""}
                      onChange={(e) => setSelectedUser({ ...selectedUser, bankName: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-bankAccountNumber">Account Number</Label>
                      <Input
                        id="edit-bankAccountNumber"
                        value={selectedUser.bankAccountNumber || ""}
                        onChange={(e) => setSelectedUser({ ...selectedUser, bankAccountNumber: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-bankRoutingNumber">Routing Number</Label>
                      <Input
                        id="edit-bankRoutingNumber"
                        value={selectedUser.bankRoutingNumber || ""}
                        onChange={(e) => setSelectedUser({ ...selectedUser, bankRoutingNumber: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="sm:justify-start">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUser}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="py-4">
              <div className="p-4 bg-muted rounded-md">
                <p><span className="font-medium">Username:</span> {selectedUser.username}</p>
                <p><span className="font-medium">Name:</span> {selectedUser.fullName}</p>
                <p><span className="font-medium">Role:</span> {selectedUser.role}</p>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-start">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}