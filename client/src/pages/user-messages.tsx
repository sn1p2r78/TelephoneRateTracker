import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import SidebarNav from '@/components/sidebar-nav';
import HeaderNav from '@/components/header-nav';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RefreshCw, Search, ArchiveIcon, CheckCircle, Clock, MessageSquare, SendHorizonal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { UserMessage, insertUserMessageSchema } from '@shared/schema';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function UserMessages() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMessage, setSelectedMessage] = useState<UserMessage | null>(null);
  const [replyText, setReplyText] = useState('');

  const { toast } = useToast();

  const { data: messages, isLoading, refetch } = useQuery<UserMessage[]>({
    queryKey: ['/api/user-messages'],
    refetchOnWindowFocus: false,
  });

  const updateMessageMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: Partial<UserMessage> }) => {
      const res = await apiRequest("PUT", `/api/user-messages/${id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Message updated successfully"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user-messages'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const filteredMessages = messages?.filter(message => {
    const matchesSearch = 
      message.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.senderNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const markAsRead = (message: UserMessage) => {
    if (message.isRead) return;
    
    updateMessageMutation.mutate({
      id: message.id,
      data: {
        ...message,
        isRead: true
      }
    });
  };

  const updateMessageStatus = (message: UserMessage, status: 'pending' | 'responded' | 'archived') => {
    updateMessageMutation.mutate({
      id: message.id,
      data: {
        ...message,
        status
      }
    });
  };

  const handleSendReply = () => {
    if (!selectedMessage || !replyText.trim()) return;
    
    // In a real application, this would send the reply message
    // For now, we'll just mark the message as responded
    updateMessageMutation.mutate({
      id: selectedMessage.id,
      data: {
        ...selectedMessage,
        status: 'responded',
        isRead: true
      }
    });
    
    toast({
      title: "Reply Sent",
      description: "Your reply has been sent successfully"
    });
    
    setReplyText('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-accent/10 text-accent">Pending</Badge>;
      case 'responded':
        return <Badge variant="outline" className="bg-success/10 text-success">Responded</Badge>;
      case 'archived':
        return <Badge variant="outline" className="bg-muted">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-muted">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 md:relative md:flex transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <SidebarNav />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderNav title="User Messages" toggleSidebar={toggleSidebar} />

        {/* Main Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">User Messages</h1>
            <p className="text-muted-foreground">Manage customer communications</p>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-wrap gap-4 justify-between">
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-10 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-4 items-end w-full md:w-auto">
                  <div className="w-full md:w-auto">
                    <Label className="text-sm">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Messages</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="responded">Responded</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button
                    onClick={() => refetch()}
                    variant="outline"
                    className="ml-auto flex items-center"
                    disabled={isLoading}
                  >
                    <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Messages List */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardContent className="p-0">
                  <div className="border-b border-border p-4">
                    <h3 className="font-semibold">Messages</h3>
                    <p className="text-sm text-muted-foreground">
                      {filteredMessages?.length || 0} total messages, {
                        filteredMessages?.filter(m => !m.isRead).length || 0
                      } unread
                    </p>
                  </div>
                  <div className="divide-y divide-border overflow-y-auto max-h-[calc(100vh-300px)]">
                    {isLoading ? (
                      Array(5).fill(0).map((_, index) => (
                        <div key={index} className="p-4">
                          <div className="flex justify-between mb-1">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-5 w-16" />
                          </div>
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ))
                    ) : filteredMessages && filteredMessages.length > 0 ? (
                      filteredMessages.map((message) => (
                        <div 
                          key={message.id} 
                          className={`p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                            selectedMessage?.id === message.id ? 'bg-muted/80' : ''
                          } ${!message.isRead ? 'border-l-4 border-l-primary' : ''}`}
                          onClick={() => {
                            setSelectedMessage(message);
                            markAsRead(message);
                          }}
                        >
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">
                              {message.senderNumber || "Unknown Sender"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                            </span>
                          </div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm truncate max-w-[200px]">
                              {message.message.substring(0, 50)}
                              {message.message.length > 50 ? '...' : ''}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            {getStatusBadge(message.status)}
                            {!message.isRead && (
                              <span className="w-2 h-2 bg-primary rounded-full"></span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">
                        No messages found
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Message Details */}
            <div className="lg:col-span-2">
              <Card className="h-full flex flex-col">
                {selectedMessage ? (
                  <>
                    <CardContent className="p-4 border-b border-border flex justify-between">
                      <div>
                        <h3 className="font-semibold">Message Details</h3>
                        <p className="text-sm text-muted-foreground">
                          From: {selectedMessage.senderNumber || "Unknown Sender"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateMessageStatus(selectedMessage, 'archived')}
                          disabled={selectedMessage.status === 'archived'}
                        >
                          <ArchiveIcon className="h-4 w-4 mr-1" />
                          Archive
                        </Button>
                        {selectedMessage.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateMessageStatus(selectedMessage, 'responded')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Responded
                          </Button>
                        )}
                      </div>
                    </CardContent>
                    <div className="flex-grow overflow-y-auto p-4">
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">
                            Received {new Date(selectedMessage.timestamp).toLocaleString()}
                          </span>
                          <div>
                            {getStatusBadge(selectedMessage.status)}
                          </div>
                        </div>
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-t border-border p-4">
                      <div className="mb-2">
                        <Label>Reply to this message</Label>
                        <Textarea
                          placeholder="Type your response here..."
                          className="mt-1"
                          rows={3}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          disabled={selectedMessage.status === 'archived'}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={handleSendReply}
                          className="flex items-center"
                          disabled={!replyText.trim() || selectedMessage.status === 'archived'}
                        >
                          <SendHorizonal className="h-4 w-4 mr-2" />
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-grow p-6 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="font-medium text-lg">No Message Selected</h3>
                    <p className="text-muted-foreground">Select a message from the list to view its details</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
