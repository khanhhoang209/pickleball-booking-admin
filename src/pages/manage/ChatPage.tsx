import React, { useEffect, useState, useRef } from 'react'
import AdminLayout from '~/components/layout/AdminLayout'
import { Card } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { ChatService } from '~/services/chatService'
import { useAuth } from '~/contexts/AuthContext'
import type { ChatRoom, ChatMessage } from '~/types/chat'
import { Send, User, Circle } from 'lucide-react'

const ChatPage: React.FC = () => {
  const { user } = useAuth()
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Subscribe to chat rooms
  useEffect(() => {
    if (!user?.id) {
      console.log('ChatPage: No user ID found')
      return
    }

    console.log('ChatPage: Subscribing to chat rooms for user:', user.id)
    const unsubscribe = ChatService.subscribeToRooms(user.id, (rooms) => {
      console.log('ChatPage: Received chat rooms:', rooms)
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

    console.log('ChatPage: Subscribing to messages for room:', selectedRoom.customerId)
    const unsubscribe = ChatService.subscribeToMessages(selectedRoom.customerId, (msgs) => {
      console.log('ChatPage: Received messages:', msgs)
      setMessages(msgs)
    })

    // Mark messages as read
    if (user?.id) {
      ChatService.markMessagesAsRead(selectedRoom.customerId)
    }

    return () => unsubscribe()
  }, [selectedRoom, user?.id])

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
                  <div>
                    <h3 className='font-semibold text-gray-900'>{selectedRoom.customerName}</h3>
                    <p className='text-sm text-gray-500'>
                      {selectedRoom.isOnline ? 'Online' : 'Offline'} • {selectedRoom.customerEmail}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50'>
                  {messages.length === 0 ? (
                    <div className='text-center text-gray-500 py-8'>
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      console.log('Rendering message:', msg)
                      return (
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
                            <p className='text-sm font-medium mb-1'>
                              {msg.senderName} ({msg.senderRole})
                            </p>
                            <p className='text-sm'>{msg.message || '(no message text)'}</p>
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
                      )
                    })
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
