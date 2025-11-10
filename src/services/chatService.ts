import { database } from '~/config/firebase'
import { ref, onValue, push, set, update, off, type DatabaseReference } from 'firebase/database'
import type { ChatMessage, ChatRoom } from '~/types/chat'

export class ChatService {
  // Subscribe to all chat rooms for admin
  static subscribeToRooms(_adminId: string, callback: (rooms: ChatRoom[]) => void) {
    // First try chatRooms collection
    const roomsRef = ref(database, 'chatRooms')
    
    onValue(roomsRef, (snapshot) => {
      const rooms: ChatRoom[] = []
      
      if (snapshot.exists()) {
        const data = snapshot.val()
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
        const messagesRef = ref(database, 'messages')
        onValue(messagesRef, (messagesSnapshot) => {
          if (messagesSnapshot.exists()) {
            const messagesData = messagesSnapshot.val()
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
                unreadCount: 0,
                isOnline: false
              })
            })
            
            // Sort by last message timestamp (newest first)
            rooms.sort((a, b) => b.lastMessageTimestamp - a.lastMessageTimestamp)
          }
          callback(rooms)
        })
      }
    })
    
    return () => off(roomsRef)
  }

  // Subscribe to messages in a specific chat room
  static subscribeToMessages(customerId: string, callback: (messages: ChatMessage[]) => void) {
    // Many customer apps save messages under nested paths. Prefer:
    // 1) chatRooms/{customerId}/messages/{messageId}
    // 2) messages/{customerId}/{messageId}
    // 3) Flat messages/{messageId} (fallback)

    const nestedInRoomRef = ref(database, `chatRooms/${customerId}/messages`)
    const nestedMessagesRef = ref(database, `messages/${customerId}`)
    const flatMessagesRef = ref(database, 'messages')

    let unsubscribeActive: (() => void) | null = null

    type RawMessage = {
      senderId?: string
      senderName?: string
      senderRole?: 'admin' | 'customer'
      receiverId?: string
      messageText?: string
      message?: string
      timestamp?: number | string
      read?: boolean
      customerId?: string
    }

    const mapFromObject = (data: Record<string, RawMessage>): ChatMessage[] => {
      const msgs: ChatMessage[] = []
      Object.keys(data).forEach((id) => {
        const msg = data[id]
        const role = ((): 'admin' | 'customer' => {
          if (msg.senderRole === 'admin' || msg.senderRole === 'customer') return msg.senderRole
          // Infer when missing
          if (msg.senderId === customerId) return 'customer'
          return 'admin'
        })()

        msgs.push({
          id,
          senderId: msg.senderId || '',
          senderName: msg.senderName || '',
          senderRole: role,
          message: msg.messageText || msg.message || '',
          timestamp: Number(msg.timestamp) || 0,
          read: Boolean(msg.read)
        })
      })
      msgs.sort((a, b) => a.timestamp - b.timestamp)
      return msgs
    }

    // Attach a live listener to the chosen ref
    const attach = (which: 'room' | 'nested' | 'flat') => {
      if (unsubscribeActive) unsubscribeActive()
      const dbRef = which === 'room' ? nestedInRoomRef : which === 'nested' ? nestedMessagesRef : flatMessagesRef
      onValue(dbRef, (snap) => {
        if (!snap.exists()) return callback([])
        const raw = snap.val()
        if (which === 'flat') {
          // Filter only messages related to this customer
          const related: Record<string, RawMessage> = {}
          Object.keys(raw).forEach((mid) => {
            const m = raw[mid]
            if (m.senderId === customerId || m.receiverId === customerId || m.customerId === customerId) {
              related[mid] = m
            }
          })
          return callback(mapFromObject(related))
        }
        callback(mapFromObject(raw))
      })
      unsubscribeActive = () => off(dbRef)
    }

    // Detect which structure exists (in priority order) then attach
    let detected = false
    const detectUnsub1 = onValue(nestedInRoomRef, (snap) => {
      if (!detected && snap.exists()) {
        detected = true
        attach('room')
      }
    }, (error) => console.warn('room detect error', error), { onlyOnce: true })

    const detectUnsub2 = onValue(nestedMessagesRef, (snap) => {
      if (!detected && snap.exists()) {
        detected = true
        attach('nested')
      }
    }, (error) => console.warn('nested detect error', error), { onlyOnce: true })

    const detectUnsub3 = onValue(flatMessagesRef, () => {
      if (!detected) {
        // If neither nested path exists, fall back to flat
        detected = true
        attach('flat')
      }
    }, (error) => console.warn('flat detect error', error), { onlyOnce: true })

    return () => {
      if (unsubscribeActive) unsubscribeActive()
      off(nestedInRoomRef)
      off(nestedMessagesRef)
      off(flatMessagesRef)
      // also clean detection listeners
  try { if (detectUnsub1) detectUnsub1() } catch (e) { console.warn('unsub1 error', e) }
  try { if (detectUnsub2) detectUnsub2() } catch (e) { console.warn('unsub2 error', e) }
  try { if (detectUnsub3) detectUnsub3() } catch (e) { console.warn('unsub3 error', e) }
    }
  }

  // Send a message
  static async sendMessage(
    customerId: string,
    adminId: string,
    adminName: string,
    message: string
  ) {
    // Standardize on nested paths for compatibility with customer app
    const messageData = {
      senderId: adminId,
      senderName: adminName,
      senderRole: 'admin',
      receiverId: customerId,
      messageText: message,
      message: message,
      timestamp: Date.now(),
      type: 'text',
      read: false
    }

    // 1) chatRooms/{customerId}/messages/{messageId}
    const roomMessagesRef = ref(database, `chatRooms/${customerId}/messages`)
    const roomMsgRef = push(roomMessagesRef)
    await set(roomMsgRef, messageData)

    // 2) Also write to messages/{customerId}/{messageId} for broader compatibility
    const nestedMessagesRef = ref(database, `messages/${customerId}`)
    const nestedMsgRef = push(nestedMessagesRef)
    await set(nestedMsgRef, messageData)
    
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
    const nestedMessagesRef = ref(database, `messages/${customerId}`)
    const roomMessagesRef = ref(database, `chatRooms/${customerId}/messages`)

    const markPath = async (dbRef: DatabaseReference) => {
      await new Promise<void>((resolve) => {
        onValue(dbRef, async (snapshot) => {
          if (snapshot.exists()) {
            const updates: Record<string, boolean> = {}
            const data = snapshot.val()
            Object.keys(data).forEach((messageId) => {
              const msg = data[messageId]
              if (msg.senderRole === 'customer' && !msg.read) {
                updates[`${messageId}/read`] = true
              }
            })
            if (Object.keys(updates).length > 0) {
              await update(dbRef, updates)
            }
          }
          resolve()
        }, (error) => console.warn('mark read error', error), { onlyOnce: true })
      })
    }

    // Try both nested locations
    await markPath(nestedMessagesRef)
    await markPath(roomMessagesRef)
    
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
