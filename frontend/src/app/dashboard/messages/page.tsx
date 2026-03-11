
"use client"

import { useState, useEffect, useRef } from "react"
import {
    Search,
    Plus,
    MoreVertical,
    Phone,
    Video,
    Smile,
    Paperclip,
    Send,
    Hash,
    MessageSquare,
    Users
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"
import { socket } from "@/lib/socket"
import api from "@/lib/api"
import { toast } from "sonner" // Assuming sonner is installed, similar to previous tasks

// Types
interface User {
    id: string;
    name: string;
    avatar?: string | null;
    status: 'online' | 'offline' | 'busy';
}

interface Channel {
    id: string;
    name: string;
    type: 'DIRECT' | 'GROUP' | 'PROJECT' | 'CLIENT';
    members: { user: User }[];
    projectId?: string | null;
    updatedAt: string;
}

interface Message {
    id: string;
    senderId: string;
    content: string;
    channelId: string;
    createdAt: string; // ISO string
    attachments?: any[]; // Simple for now
    sender: {
        id: string;
        name: string;
        avatar?: string | null;
    }
}

export default function MessagesPage() {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const { user: currentUser, session } = useAuth()
    const token = session?.access_token
    // State
    const [channels, setChannels] = useState<Channel[]>([])
    const [activeConversation, setActiveConversation] = useState<string | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [messageInput, setMessageInput] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [users, setUsers] = useState<User[]>([]) // For creating new DMs

    // Group Creation State
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
    const [newGroupName, setNewGroupName] = useState("")
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
    const [isCreatingGroup, setIsCreatingGroup] = useState(false)

    // DM Creation State
    const [isNewDMOpen, setIsNewDMOpen] = useState(false)

    const scrollRef = useRef<HTMLDivElement>(null)

    // ... (keep existing useEffects)

    const handleStartDM = async (targetUserId: string) => {
        if (!token || !currentUser) return

        // Check if DM already exists
        const existingChannel = channels.find(c =>
            c.type === 'DIRECT' &&
            c.members.some(m => m.user.id === targetUserId)
        )

        if (existingChannel) {
            setActiveConversation(existingChannel.id)
            setIsNewDMOpen(false)
            return
        }

        // Create new DM
        try {
            const res = await api.post(`/messages/channels`, {
                name: 'Direct Message', // backend might ignore this or use it, frontend ignores it for DM display
                type: 'DIRECT',
                memberIds: [targetUserId]
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            const newChannel = res.data
            setChannels(prev => [newChannel, ...prev])
            setActiveConversation(newChannel.id)
            setIsNewDMOpen(false)
            toast.success("Conversation started")
        } catch (error) {
            console.error("Failed to start conversation", error)
            toast.error("Failed to start conversation")
        }
    }

    // ... (keep existing handlers)


    useEffect(() => {
        const fetchUsers = async () => {
            if (!token) return;
            try {
                const res = await api.get(`/messages/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setUsers(res.data)
            } catch (error) {
                console.error("Failed to fetch users", error)
            }
        }
        fetchUsers()
    }, [token])

    // Fetch Channels
    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const res = await api.get(`/messages/channels`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setChannels(res.data)
                if (res.data.length > 0 && !activeConversation) {
                    // Optionally set first channel active
                    // setActiveConversation(res.data[0].id) 
                }
            } catch (error) {
                console.error("Failed to fetch channels", error)
                toast.error("Failed to load conversations")
            } finally {
                setIsLoading(false)
            }
        }

        if (token) {
            fetchChannels()
        }
    }, [token])

    // Fetch Messages when activeConversation changes
    useEffect(() => {
        if (!activeConversation || !token) return;

        const fetchMessages = async () => {
            try {
                const res = await api.get(`/messages/channels/${activeConversation}/messages`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setMessages(res.data)
            } catch (error) {
                console.error("Failed to fetch messages", error)
            }
        }

        fetchMessages();

        // Join channel room
        socket.emit('join:channel', activeConversation);

        // Listen for new messages
        const handleNewMessage = (msg: Message) => {
            if (msg.channelId === activeConversation) { // Check if msg belongs to current channel
                setMessages(prev => [...prev, msg])
            }
        }

        socket.on('message:new', handleNewMessage)

        return () => {
            socket.off('message:new', handleNewMessage)
        }
    }, [activeConversation, token])

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, activeConversation])

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !activeConversation || !token) return

        try {
            const res = await api.post(`/messages/messages`, {
                content: messageInput,
                channelId: activeConversation
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            const newMessage = res.data;

            // Optimistically update or wait for socket? 
            // Since we receive the message back from API, let's add it. 
            // Make sure not to duplicate if socket also sends it back to sender.
            // Usually sender shouldn't receive their own message via socket if they just added it, 
            // OR we rely entirely on socket. 

            // For now, let's rely on socket for consistency if backend broadcasts to all in room.
            // If backend broadcasts to everyone INCLUDING sender, we don't need to add it here manually.
            // But if backend broadcasts to "others", we do.
            // Let's assume we add it manually here for instant feedback, 
            // and handle deduplication if needed (e.g. by ID).

            setMessages(prev => {
                if (prev.find(m => m.id === newMessage.id)) return prev;
                return [...prev, newMessage]
            })

            // Also emit to socket so others get it? NO, API should handle persistence and emitting.
            // Our API implementation currently does NOT emit (TODO in backend). 
            // We need to implement emission from client side OR fix backend.
            // Given I can't easily change backend socket structure without more work, 
            // I will emit from client side as well for now as a fallback/hybrid.
            socket.emit('message:new', {
                ...newMessage,
                channelId: activeConversation
            })

            setMessageInput("")
        } catch (error) {
            console.error("Failed to send message", error)
            toast.error("Failed to send message")
        }
    }

    const handleCreateGroup = async () => {
        if (!newGroupName.trim() || selectedUserIds.length === 0 || !token) {
            toast.error("Please provide a group name and select at least one member.")
            return
        }

        setIsCreatingGroup(true)
        try {
            const res = await api.post(`/messages/channels`, {
                name: newGroupName,
                type: 'GROUP',
                memberIds: selectedUserIds
            }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            const newChannel = res.data
            setChannels(prev => [newChannel, ...prev])
            setActiveConversation(newChannel.id)
            setIsCreateGroupOpen(false)
            setNewGroupName("")
            setSelectedUserIds([])
            toast.success("Group created successfully")
        } catch (error) {
            console.error("Failed to create group", error)
            toast.error("Failed to create group")
        } finally {
            setIsCreatingGroup(false)
        }
    }

    const toggleUserSelection = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        )
    }

    const getActiveDetails = () => {
        if (!activeConversation) return null
        const channel = channels.find(c => c.id === activeConversation)
        if (!channel) return null

        if (channel.type === 'DIRECT') {
            // Find the other user
            const otherMember = channel.members.find(m => m.user.id !== currentUser?.id)?.user
            if (otherMember) {
                return { name: otherMember.name, status: 'offline', type: 'user', avatar: otherMember.avatar } // Mock status for now
            }
            return { name: "Unknown User", type: 'user' }
        }

        return { name: channel.name, type: 'channel' }
    }

    const activeDetails = getActiveDetails()

    return (
        <div className={cn("h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6 container mx-auto p-4 max-w-7xl", isDark && "font-sans")}>

            {/* Sidebar List */}
            <div className={cn(
                "w-full md:w-80 flex flex-col rounded-2xl border shadow-sm h-full overflow-hidden transition-all duration-300",
                isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200"
            )}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-border">
                    <div className="relative">
                        <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4", isDark ? "text-gray-400" : "text-gray-500")} />
                        <Input
                            placeholder="Search messages..."
                            className={cn(
                                "pl-9",
                                isDark ? "bg-[#2c2c2c] border-transparent text-white placeholder:text-gray-500 focus-visible:ring-offset-0" : "bg-gray-100 border-transparent focus-visible:ring-offset-0"
                            )}
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-3 space-y-6">
                        {/* Channels Section */}
                        {channels.filter(c => c.type !== 'DIRECT').length > 0 && (
                            <div>
                                <div className="px-3 mb-2 flex justify-between items-center group">
                                    <h3 className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-gray-400" : "text-gray-500")}>Channels</h3>
                                    <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100">
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>
                                <div className="space-y-0.5">
                                    {channels.filter(c => c.type !== 'DIRECT').map(channel => (
                                        <button
                                            key={channel.id}
                                            onClick={() => setActiveConversation(channel.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                                                activeConversation === channel.id
                                                    ? (isDark ? "bg-[#C0FF00] text-black font-medium" : "bg-indigo-100 text-indigo-900 font-medium")
                                                    : (isDark ? "text-gray-300 hover:bg-white/5" : "text-gray-600 hover:bg-gray-100")
                                            )}
                                        >
                                            <Hash className="h-4 w-4 opacity-70" />
                                            {channel.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Direct Messages Section */}
                        <div>
                            <div className="px-3 mb-2 flex justify-between items-center group">
                                <h3 className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-gray-400" : "text-gray-500")}>Direct Messages</h3>
                                <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100">
                                    <Plus className="h-3 w-3" />
                                </Button>
                            </div>
                            <div className="space-y-1">
                                {channels.filter(c => c.type === 'DIRECT').map(channel => {
                                    const otherUser = channel.members.find(m => m.user.id !== currentUser?.id)?.user
                                    if (!otherUser) return null

                                    return (
                                        <button
                                            key={channel.id}
                                            onClick={() => setActiveConversation(channel.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                                                activeConversation === channel.id
                                                    ? (isDark ? "bg-white/10 text-white" : "bg-indigo-100 text-indigo-900")
                                                    : (isDark ? "text-gray-300 hover:bg-white/5" : "text-gray-600 hover:bg-gray-50")
                                            )}
                                        >
                                            <div className="relative">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={otherUser.avatar || undefined} />
                                                    <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                {/* Status indicator can be real if we implement socket user online events */}
                                                <span className={cn(
                                                    "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2",
                                                    isDark ? "border-[#1c1c1c]" : "border-white",
                                                    "bg-gray-400"
                                                )} />
                                            </div>
                                            <span className="flex-1 text-left truncate font-medium">{otherUser.name}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className={cn(
                "flex-1 flex flex-col rounded-2xl border shadow-sm h-full overflow-hidden",
                isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-200"
            )}>
                {activeConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className={cn("h-16 px-6 border-b flex items-center justify-between shrink-0", isDark ? "border-white/10 bg-[#1c1c1c]" : "border-slate-100 bg-white")}>
                            <div className="flex items-center gap-3">
                                {activeDetails?.type === 'channel' ? (
                                    <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", isDark ? "bg-white/10 text-white" : "bg-gray-100 text-gray-600")}>
                                        <Hash className="h-5 w-5" />
                                    </div>
                                ) : (
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={activeDetails?.avatar || undefined} />
                                        <AvatarFallback>{activeDetails?.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                )}
                                <div>
                                    <h2 className={cn("text-base font-bold leading-none", isDark ? "text-white" : "text-gray-900")}>
                                        {activeDetails?.name}
                                    </h2>
                                    {activeDetails?.type === 'user' && (
                                        <span className={cn("text-xs flex items-center gap-1.5 mt-1 opacity-70", isDark ? "text-gray-400" : "text-gray-500")}>
                                            {/* <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> */}
                                            {/* Active Status */}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon"><Phone className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon"><Video className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div
                            ref={scrollRef}
                            className={cn("flex-1 overflow-y-auto p-6 space-y-6", isDark ? "bg-[#111]" : "bg-slate-50")}
                        >
                            {messages.length > 0 ? (
                                messages.map((msg, idx) => {
                                    const isMe = msg.senderId === currentUser?.id
                                    const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId
                                    // const sender = isMe ? currentUser : users.find(u => u.id === msg.senderId) // users list usage?
                                    // We have sender info in msg object now

                                    return (
                                        <div key={msg.id} className={cn("flex gap-3 max-w-[80%]", isMe ? "ml-auto flex-row-reverse" : "")}>
                                            {!isMe && showAvatar ? (
                                                <Avatar className="h-8 w-8 mt-1">
                                                    <AvatarImage src={msg.sender.avatar || undefined} />
                                                    <AvatarFallback>{msg.sender.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            ) : !isMe ? (
                                                <div className="w-8 shrink-0" />
                                            ) : null}

                                            <div className="space-y-1">
                                                {!isMe && activeDetails?.type === 'channel' && showAvatar && (
                                                    <p className="text-xs font-medium text-gray-500 ml-1">{msg.sender.name}</p>
                                                )}
                                                <div className={cn(
                                                    "px-4 py-2.5 text-sm rounded-2xl shadow-sm",
                                                    isMe
                                                        ? (isDark ? "bg-[#C0FF00] text-black rounded-tr-none" : "bg-blue-600 text-white rounded-tr-none")
                                                        : (isDark ? "bg-[#2c2c2c] text-white rounded-tl-none border border-white/5" : "bg-white text-gray-800 rounded-tl-none border border-slate-200")
                                                )}>
                                                    <p className="leading-relaxed">{msg.content}</p>
                                                </div>
                                                <p className={cn(
                                                    "text-[10px] opacity-70 px-1",
                                                    isMe ? "text-right" : "text-left",
                                                    isDark ? "text-gray-500" : "text-gray-400"
                                                )}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-4", isDark ? "bg-white/5" : "bg-gray-100")}>
                                        <MessageSquare className="h-8 w-8 opacity-50" />
                                    </div>
                                    <p className="text-sm font-medium">No messages yet</p>
                                    <p className="text-xs mt-1 opacity-70">Start the conversation</p>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className={cn("p-4 border-t", isDark ? "bg-[#1c1c1c] border-white/10" : "bg-white border-slate-100")}>
                            <div className={cn(
                                "flex items-end gap-2 rounded-xl p-2 transition-all",
                                isDark ? "bg-[#2c2c2c] border border-transparent focus-within:border-white/10" : "bg-white border border-slate-200 shadow-sm focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20"
                            )}>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-gray-600">
                                    <Plus className="h-5 w-5" />
                                </Button>
                                <textarea
                                    className={cn(
                                        "flex-1 bg-transparent border-0 focus:ring-0 resize-none max-h-32 min-h-[2.5rem] py-2.5 text-sm",
                                        isDark ? "text-white placeholder:text-gray-500" : "text-gray-900 placeholder:text-gray-400"
                                    )}
                                    placeholder={`Message ${activeDetails?.name}...`}
                                    rows={1}
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                />
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-400 hover:text-gray-600">
                                        <Smile className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        className={cn(
                                            "h-9 w-9 rounded-lg transition-all",
                                            messageInput.trim()
                                                ? (isDark ? "bg-[#C0FF00] text-black hover:bg-[#b0eb00]" : "bg-blue-600 text-white hover:bg-blue-700")
                                                : "bg-transparent text-gray-300 pointer-events-none"
                                        )}
                                        onClick={handleSendMessage}
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className={cn("w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-sm", isDark ? "bg-white/5" : "bg-white border border-slate-100")}>
                            <MessageSquare className={cn("h-10 w-10", isDark ? "text-gray-600" : "text-slate-300")} />
                        </div>
                        <h3 className={cn("text-xl font-semibold mb-2", isDark ? "text-white" : "text-gray-900")}>Select a Conversation</h3>
                        <p className={cn("text-sm max-w-xs mx-auto", isDark ? "text-gray-500" : "text-gray-500")}>
                            Choose a channel or direct message from the sidebar to start chatting.
                        </p>
                    </div>
                )}
            </div>

            {/* Create Group Dialog */}
            <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
                <DialogContent className={cn("sm:max-w-[425px]", isDark ? "bg-[#1c1c1c] text-white border-white/10" : "")}>
                    <DialogHeader>
                        <DialogTitle>Create New Group</DialogTitle>
                        <DialogDescription className={isDark ? "text-gray-400" : ""}>
                            Create a new group channel to chat with your team.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={newGroupName}
                                onChange={(e) => setNewGroupName(e.target.value)}
                                className="col-span-3"
                                placeholder="Group Name"
                            />
                        </div>
                        <div className="space-y-4">
                            <Label>Select Members</Label>
                            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                                {users.length > 0 ? (
                                    users.map((u) => (
                                        <div key={u.id} className="flex items-center space-x-2 py-2">
                                            <Checkbox
                                                id={`user-${u.id}`}
                                                checked={selectedUserIds.includes(u.id)}
                                                onCheckedChange={() => toggleUserSelection(u.id)}
                                            />
                                            <label
                                                htmlFor={`user-${u.id}`}
                                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                                            >
                                                <Avatar className="h-6 w-6">
                                                    <AvatarImage src={u.avatar || undefined} />
                                                    <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                {u.name}
                                            </label>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No users found.</p>
                                )}
                            </ScrollArea>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateGroupOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateGroup} disabled={isCreatingGroup}>
                            {isCreatingGroup ? "Creating..." : "Create Group"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* New DM Dialog */}
            <Dialog open={isNewDMOpen} onOpenChange={setIsNewDMOpen}>
                <DialogContent className={cn("sm:max-w-[425px]", isDark ? "bg-[#1c1c1c] text-white border-white/10" : "")}>
                    <DialogHeader>
                        <DialogTitle>New Message</DialogTitle>
                        <DialogDescription className={isDark ? "text-gray-400" : ""}>
                            Select a user to start a conversation with.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <ScrollArea className="h-[300px] w-full rounded-md border p-2">
                            {users.length > 0 ? (
                                <div className="space-y-1">
                                    {users.map((u) => (
                                        <button
                                            key={u.id}
                                            onClick={() => handleStartDM(u.id)}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                                                isDark ? "hover:bg-white/10 text-white" : "hover:bg-slate-100 text-slate-900"
                                            )}
                                        >
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={u.avatar || undefined} />
                                                <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <span className="font-medium">{u.name}</span>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-8">No users found.</p>
                            )}
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
