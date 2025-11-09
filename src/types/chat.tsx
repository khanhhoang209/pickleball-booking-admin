export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  senderRole: 'admin' | 'customer'
  message: string
  timestamp: number
  read: boolean
}

export interface ChatRoom {
  id: string // userId
  customerId: string
  customerName: string
  customerEmail: string
  lastMessage: string
  lastMessageTimestamp: number
  unreadCount: number
  isOnline: boolean
}

export interface ChatUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'customer'
  isOnline: boolean
  lastSeen: number
}
