import { database } from '~/config/firebase'
import { ref, onValue, push, set, update, query, orderByChild, limitToLast, off } from 'firebase/database'
import type { ChatMessage, ChatRoom } from '~/types/chat'

export class ChatService {
  // Subscribe to all chat rooms for admin
  static subscribeToRooms(_adminId: string, callback: (rooms: ChatRoom[]) => void) {
    console.log('ChatService: subscribeToRooms called')
    // First try chatRooms collection
    const roomsRef = ref(database, 'chatRooms')
    
    onValue(roomsRef, (snapshot) => {
      console.log('ChatService: chatRooms snapshot exists?', snapshot.exists())
      const rooms: ChatRoom[] = []
      
      if (snapshot.exists()) {
        const data = snapshot.val()
        console.log('ChatService: chatRooms data:', data)
        Object.keys(data).forEach((customerId) => {
          const room = data[customerId]
          rooms.push({
            id: customerId,
            customerId: customerId,
            customerName: room.customerName || 'Unknown User',
            customerEmail: room.customerEmail || '',
            lastMessage: room.lastMessage || '',
            lastMessageTimestamp: room.lastMessageTimestamp || 0,
            unreadCount: room.unreadCountAdmin || 0,
            isOnline: room.customerOnline || false
          })
        })
        
        // Sort by last message timestamp (newest first)
        rooms.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp)
        callback(rooms)
      } else {
        // If no chatRooms, build from messages collection
        console.log('ChatService: No chatRooms found, checking messages collection')
        const messagesRef = ref(database, 'messages')
        onValue(messagesRef, (messagesSnapshot) => {
          console.log('ChatService: messages snapshot exists?', messagesSnapshot.exists())
          if (messagesSnapshot.exists()) {
            const messagesData = messagesSnapshot.val()
            console.log('ChatService: messages data:', messagesData)
            Object.keys(messagesData).forEach((customerId) => {
              const customerMessages = messagesData[customerId]
              const messageIds = Object.keys(customerMessages)
              const lastMessageId = messageIds[messageIds.length - 1]
              const lastMsg = customerMessages[lastMessageId]
              
              rooms.push({
                id: customerId,
                customerId: customerId,
                customerName: lastMsg.senderName || 'Unknown User',
                customerEmail: '',
                lastMessage: lastMsg.messageText || lastMsg.message || '',
                lastMessageTimestamp: lastMsg.timestamp || 0,
                unreadCount: 0, // Calculate unread later
                isOnline: false
              })
            })
            
            // Sort by last message timestamp (newest first)
            rooms.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp)
          }
          console.log('ChatService: Final rooms:', rooms)
          callback(rooms)
        })
      }
    })
    
    return () => off(roomsRef)
  }

  // Subscribe to messages in a specific chat room
  static subscribeToMessages(customerId: string, callback: (messages: ChatMessage[]) => void) {
    console.log('ChatService: subscribeToMessages called for customer:', customerId)
    const messagesRef = query(
      ref(database, `messages/${customerId}`),
      orderByChild('timestamp'),
      limitToLast(100)
    )
    
    onValue(messagesRef, (snapshot) => {
      const messages: ChatMessage[] = []
      
      if (snapshot.exists()) {
        const data = snapshot.val()
        console.log('ChatService: Raw messages data:', data)
        Object.keys(data).forEach((messageId) => {
          const msg = data[messageId]
          console.log('ChatService: Processing message:', messageId, msg)
          messages.push({
            id: messageId,
            senderId: msg.senderId,
            senderName: msg.senderName,
            senderRole: msg.senderRole || (msg.senderId?.startsWith('user_') ? 'customer' : 'admin'),
            message: msg.messageText || msg.message || '',
            timestamp: msg.timestamp,
            read: msg.read || false
          })
        })
        
        // Sort by timestamp (oldest first for chat display)
        messages.sort((a, b) => a.timestamp - b.timestamp)
      }
      
      console.log('ChatService: Final messages array:', messages)
      callback(messages)
    })
    
    return () => off(messagesRef)
  }

  // Send a message
  static async sendMessage(
    customerId: string,
    adminId: string,
    adminName: string,
    message: string
  ) {
    const messagesRef = ref(database, `messages/${customerId}`)
    const newMessageRef = push(messagesRef)
    
    const messageData = {
      senderId: adminId,
      senderName: adminName,
      senderRole: 'admin',
      messageText: message, // Use messageText to match existing structure
      timestamp: Date.now(),
      type: 'text',
      read: false
    }
    
    await set(newMessageRef, messageData)
    
    // Update chat room info (if chatRooms collection exists)
    const roomRef = ref(database, `chatRooms/${customerId}`)
    await update(roomRef, {
      lastMessage: message,
      lastMessageTimestamp: Date.now(),
      unreadCountCustomer: 1 // Customer has 1 unread message from admin
    })
  }

  // Mark messages as read
  static async markMessagesAsRead(customerId: string) {
    const messagesRef = ref(database, `messages/${customerId}`)
    
    onValue(messagesRef, async (snapshot) => {
      if (snapshot.exists()) {
        const updates: Record<string, boolean> = {}
        const data = snapshot.val()
        
        Object.keys(data).forEach((messageId) => {
          const msg = data[messageId]
          // Mark customer messages as read
          if (msg.senderRole === 'customer' && !msg.read) {
            updates[`${messageId}/read`] = true
          }
        })
        
        if (Object.keys(updates).length > 0) {
          await update(messagesRef, updates)
        }
      }
    }, { onlyOnce: true })
    
    // Reset admin unread count
    const roomRef = ref(database, `chatRooms/${customerId}`)
    await update(roomRef, {
      unreadCountAdmin: 0
    })
  }

  // Update admin online status
  static async updateAdminStatus(adminId: string, isOnline: boolean) {
    const adminRef = ref(database, `admins/${adminId}`)
    await update(adminRef, {
      isOnline: isOnline,
      lastSeen: Date.now()
    })
  }
}
