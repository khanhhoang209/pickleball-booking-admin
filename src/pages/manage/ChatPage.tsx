import React, { useEffect, useState, useRef } from 'react'
import AdminLayout from '~/components/layout/AdminLayout'
import { Card } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover'
import { ChatService } from '~/services/chatService'
import { useAuth } from '~/contexts/AuthContext'
import type { ChatRoom, ChatMessage } from '~/types/chat'
import { Send, User, Circle, Mail, Phone, Copy } from 'lucide-react'
import axiosInstance from '~/config/axios'
import type { UsersResponse } from '~/types/user'

const ChatPage: React.FC = () => {
  const { user } = useAuth()
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [contactLoading, setContactLoading] = useState(false)
  const [customerPhone, setCustomerPhone] = useState<string | null>(null)

  // Subscribe to chat rooms
  useEffect(() => {
    if (!user?.id) return

    const unsubscribe = ChatService.subscribeToRooms(user.id, (rooms) => {
      setChatRooms(rooms)
    })

    // Update admin online status
    ChatService.updateAdminStatus(user.id, true)

    return () => {
      unsubscribe()
      ChatService.updateAdminStatus(user.id, false)
    }
  }, [user?.id])

  // Subscribe to messages when room is selected
  useEffect(() => {
    if (!selectedRoom) return

    const unsubscribe = ChatService.subscribeToMessages(selectedRoom.customerId, (msgs) => {
      setMessages(msgs)
    })

    // Mark messages as read
    if (user?.id) {
      ChatService.markMessagesAsRead(selectedRoom.customerId)
    }

    return () => unsubscribe()
  }, [selectedRoom, user?.id])

  // Fetch customer contact (phone) when room changes
  useEffect(() => {
    const fetchContact = async () => {
      if (!selectedRoom?.customerEmail) {
        setCustomerPhone(null)
        return
      }
      try {
        setContactLoading(true)
        const params = new URLSearchParams()
        params.append('searchEmail', selectedRoom.customerEmail)
        params.append('pageNumber', '1')
        params.append('pageSize', '1')
        const res = await axiosInstance.get<UsersResponse>(`/v1/users?${params.toString()}`)
        const phone = res.data?.data?.[0]?.phoneNumber ?? null
        setCustomerPhone(phone)
      } catch {
        setCustomerPhone(null)
      } finally {
        setContactLoading(false)
      }
    }
    fetchContact()
  }, [selectedRoom?.customerEmail])

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom || !user?.id) return

    setSending(true)
    try {
      await ChatService.sendMessage(
        selectedRoom.customerId,
        user.id,
        user.email || 'Admin',
        newMessage.trim()
      )
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTimestamp = (timestamp: number) => {
    if (!timestamp || isNaN(timestamp)) {
      return 'Just now'
    }
    
    const date = new Date(timestamp)
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Just now'
    }
    
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    // If timestamp is in the future, just show the time
    if (diff < 0) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }

    if (hours < 24) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    } else if (hours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <AdminLayout>
      <div className='h-[calc(100vh-2rem)] p-6'>
        <div className='mb-4'>
          <h1 className='text-3xl font-bold text-gray-900'>Chat</h1>
          <p className='text-gray-500 mt-2'>Communicate with customers in real-time</p>
        </div>

        <div className='grid grid-cols-12 gap-4 h-[calc(100%-5rem)]'>
          {/* Chat Rooms List */}
          <Card className='col-span-4 p-0 overflow-hidden flex flex-col'>
            <div className='p-4 border-b bg-gray-50'>
              <h2 className='font-semibold text-lg'>Conversations</h2>
              <p className='text-sm text-gray-500'>{chatRooms.length} active chats</p>
            </div>
            <div className='flex-1 overflow-y-auto'>
              {chatRooms.length === 0 ? (
                <div className='p-8 text-center text-gray-500'>
                  <p>No conversations yet</p>
                </div>
              ) : (
                chatRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`p-4 border-b cursor-pointer transition hover:bg-gray-50 ${
                      selectedRoom?.id === room.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
                    }`}
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex items-center gap-3 flex-1'>
                        <div className='relative'>
                          <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                            <User className='w-6 h-6 text-blue-600' />
                          </div>
                          {room.isOnline && (
                            <Circle className='absolute bottom-0 right-0 w-3 h-3 fill-green-500 text-green-500' />
                          )}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center justify-between'>
                            <h3 className='font-semibold text-gray-900 truncate'>{room.customerName}</h3>
                            <span className='text-xs text-gray-500'>{formatTimestamp(room.lastMessageTimestamp)}</span>
                          </div>
                          <p className='text-sm text-gray-500 truncate'>{room.lastMessage || 'No messages yet'}</p>
                        </div>
                      </div>
                      {room.unreadCount > 0 && (
                        <Badge className='bg-red-500 text-white ml-2'>{room.unreadCount}</Badge>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Chat Messages */}
          <Card className='col-span-8 p-0 overflow-hidden flex flex-col'>
            {selectedRoom ? (
              <>
                {/* Chat Header */}
                <div className='p-4 border-b bg-gray-50 flex items-center gap-3'>
                  <div className='relative'>
                    <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                      <User className='w-5 h-5 text-blue-600' />
                    </div>
                    {selectedRoom.isOnline && (
                      <Circle className='absolute bottom-0 right-0 w-3 h-3 fill-green-500 text-green-500' />
                    )}
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-semibold text-gray-900'>{selectedRoom.customerName}</h3>
                    <p className='text-sm text-gray-500'>
                      {selectedRoom.isOnline ? 'Online' : 'Offline'} • {selectedRoom.customerEmail}
                    </p>
                  </div>
                  {/* Contact dropdown */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant='outline' size='sm'>Contact</Button>
                    </PopoverTrigger>
                    <PopoverContent align='end' className='w-80'>
                      <div className='space-y-3'>
                        <h4 className='font-semibold text-gray-900'>Customer contact</h4>
                        <div className='flex items-center justify-between p-2 rounded border bg-white'>
                          <div className='flex items-center gap-2 min-w-0'>
                            <Mail className='w-4 h-4 text-gray-500' />
                            <a
                              href={`mailto:${selectedRoom.customerEmail}`}
                              className='text-sm text-blue-600 truncate'
                              title={selectedRoom.customerEmail}
                            >
                              {selectedRoom.customerEmail || 'Not available'}
                            </a>
                          </div>
                          {selectedRoom.customerEmail && (
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => navigator.clipboard.writeText(selectedRoom.customerEmail)}
                              title='Copy email'
                            >
                              <Copy className='w-4 h-4 text-gray-500' />
                            </Button>
                          )}
                        </div>
                        <div className='flex items-center justify-between p-2 rounded border bg-white'>
                          <div className='flex items-center gap-2 min-w-0'>
                            <Phone className='w-4 h-4 text-gray-500' />
                            {contactLoading ? (
                              <span className='text-sm text-gray-500'>Loading...</span>
                            ) : customerPhone ? (
                              <a href={`tel:${customerPhone}`} className='text-sm text-blue-600 truncate' title={customerPhone}>
                                {customerPhone}
                              </a>
                            ) : (
                              <span className='text-sm text-gray-500'>Not available</span>
                            )}
                          </div>
                          {customerPhone && (
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => navigator.clipboard.writeText(customerPhone)}
                              title='Copy phone'
                            >
                              <Copy className='w-4 h-4 text-gray-500' />
                            </Button>
                          )}
                        </div>
                        <p className='text-xs text-gray-500'>Use the links to email or call the customer directly.</p>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Messages */}
                <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50'>
                  {messages.length === 0 ? (
                    <div className='text-center text-gray-500 py-8'>
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.senderRole === 'admin'
                              ? 'bg-blue-600 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          <p className='text-sm'>{msg.message}</p>
                          <div
                            className={`text-xs mt-1 ${
                              msg.senderRole === 'admin' ? 'text-blue-100' : 'text-gray-500'
                            }`}
                          >
                            {formatTimestamp(msg.timestamp)}
                            {msg.senderRole === 'admin' && msg.read && ' • Read'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className='p-4 border-t bg-white'>
                  <div className='flex items-center gap-2'>
                    <Input
                      type='text'
                      placeholder='Type your message...'
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className='flex-1'
                      disabled={sending}
                    />
                    <Button onClick={handleSendMessage} disabled={sending || !newMessage.trim()}>
                      <Send className='w-4 h-4' />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className='flex-1 flex items-center justify-center text-gray-500'>
                <div className='text-center'>
                  <User className='w-16 h-16 mx-auto mb-4 text-gray-300' />
                  <p className='text-lg font-medium'>Select a conversation</p>
                  <p className='text-sm mt-2'>Choose a customer from the list to start chatting</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

export default ChatPage
