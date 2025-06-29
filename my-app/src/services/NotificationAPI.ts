import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp, FieldValue, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import http from "axios";

// Notification API URL
const _notificationServerUrl = 'http://192.168.1.71:3000/notification';

const truncateText = (text: string, length = 30): string => {
  if (text.length <= length) {
    return text;
  }
  return `${text.substring(0, length)}...`;
};

class NotificationAPI {
  private static async getUserFCMToken(receiverId: string) {
    const db = getFirestore();
    const userDocRef = doc(db, 'users', receiverId);
    const userDoc = await getDoc(userDocRef);
    const deviceId = userDoc.data()?.fcmTokens;

    if (!deviceId || deviceId.length === 0) {
      console.error('FCM token not available for this user.');
      return null;
    }

    return deviceId;  // Could return multiple tokens for multiple devices
  }

  public static async sendFollowNotification(senderName: string, receiverId: string) {
    console.log(`Sending follow notification from ${senderName} to ${receiverId}`);

    const deviceId = await this.getUserFCMToken(receiverId);
    if (!deviceId) return;

    const body = {
      title: 'Bạn có người theo dõi mới!',
      body: `${senderName} vừa theo dõi bạn.`,
      deviceId,
    };

    try {
      const response = await http.post(_notificationServerUrl, body, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status !== 200 && response.status !== 201) {
        console.error('Notification sending failed:', response.data);
      }
    } catch (e) {
      console.error('Error sending notification:', e);
    }
  }

  public static async saveFollowNotificationToFirestore(receiverId: string, senderId: string, senderName: string) {
    const db = getFirestore();

    const notificationData = {
      receiverId,
      senderId,
      senderName,
      type: 'follow',
      message: `${senderName} vừa theo dõi bạn.`,
      timestamp: serverTimestamp(),
      isRead: false,
    };

    try {
      // Avoid saving duplicate notifications
      const notificationsRef = collection(db, 'notifications');
      const querySnapshot = await getDocs(
        query(notificationsRef, where('receiverId', '==', receiverId), where('senderId', '==', senderId), where('type', '==', 'follow'))
      );

      if (querySnapshot.empty) {
        await addDoc(collection(db, 'notifications'), notificationData);
      }
    } catch (e) {
      console.error('Error saving notification to Firestore:', e);
    }
  }

  public static async sendInviteMemberNotification(
    senderName: string,
    receiverId: string,
    groupId: string,
    groupName: string
  ) {
    console.log(`Sending invite notification from ${senderName} to ${receiverId}`);

    const deviceId = await this.getUserFCMToken(receiverId);
    if (!deviceId) return;

    const body = {
      title: 'Bạn có lời mời tham gia nhóm mới!',
      body: `${senderName} đã mời bạn tham gia nhóm ${groupName}.`,
      deviceId,
      groupId,
    };

    try {
      const response = await http.post(_notificationServerUrl, body, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status !== 200 && response.status !== 201) {
        console.error('Notification sending failed:', response.data);
      }
    } catch (e) {
      console.error('Error sending notification:', e);
    }
  }

  public static async saveInviteMemberNotificationToFirestore(
    receiverId: string,
    senderId: string,
    senderName: string,
    groupId: string,
    groupName: string
  ) {
    const db = getFirestore();

    const notificationData = {
      receiverId,
      senderId,
      senderName,
      type: 'invite_member',
      message: `${senderName} đã mời bạn tham gia nhóm ${groupName}.`,
      timestamp: serverTimestamp(),
      isRead: false,
      groupId,
      groupName,
    };

    try {
      // Avoid saving duplicate notifications
      const inviteQuery = query(
        collection(db, 'invite_member_notifications'),
        where('receiverId', '==', receiverId),
        where('groupId', '==', groupId),
        where('senderId', '==', senderId)
      );
      const querySnapshot = await getDocs(inviteQuery);

      if (querySnapshot.empty) {
        await addDoc(collection(db, 'invite_member_notifications'), notificationData);
      }
    } catch (e) {
      console.error('Error saving invite notification to Firestore:', e);
    }
  }

  public static async sendLikeNotification(senderName: string, receiverId: string, postContent: string, postId: string) {
    if (!senderName || !receiverId) return;

    console.log(`Sending like notification from ${senderName} to ${receiverId}`);

    const deviceId = await this.getUserFCMToken(receiverId);
    if (!deviceId) return;

    const body = {
      title: 'Bài viết của bạn có lượt thích mới!',
      body: `${senderName} đã thích bài viết của bạn: "${truncateText(postContent)}"`,
      deviceId,
      data: { type: 'like', postId },
    };

    try {
      await http.post(_notificationServerUrl, body, {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      console.error('Error sending like notification:', e);
    }
  }

  public static async saveLikeNotificationToFirestore(
    receiverId: string,
    senderId: string,
    senderName: string,
    postId: string,
    postContent: string
  ) {
    const db = getFirestore();

    const notificationData = {
      receiverId,
      senderId,
      senderName,
      type: 'like',
      message: `${senderName} đã thích bài viết của bạn: "${truncateText(postContent)}"`,
      postId,
      timestamp: serverTimestamp(),
      isRead: false,
    };

    try {
      await addDoc(collection(db, 'notifications'), notificationData);
    } catch (e) {
      console.error('Error saving like notification to Firestore:', e);
    }
  }

  public static async sendCommentNotification(senderName: string, receiverId: string, commentText: string, postId: string) {
    if (!senderName || !receiverId) return;

    console.log(`Sending comment notification from ${senderName} to ${receiverId}`);

    const deviceId = await this.getUserFCMToken(receiverId);
    if (!deviceId) return;

    const body = {
      title: 'Bài viết của bạn có bình luận mới!',
      body: `${senderName} đã bình luận: "${truncateText(commentText)}"`,
      deviceId,
      data: { type: 'comment', postId },
    };

    try {
      await http.post(_notificationServerUrl, body, {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      console.error('Error sending comment notification:', e);
    }
  }

  public static async saveCommentNotificationToFirestore(
    receiverId: string,
    senderId: string,
    senderName: string,
    postId: string,
    commentText: string
  ) {
    const db = getFirestore();

    const notificationData = {
      receiverId,
      senderId,
      senderName,
      type: 'comment',
      message: `${senderName} đã bình luận: "${truncateText(commentText)}"`,
      postId,
      timestamp: serverTimestamp(),
      isRead: false,
    };

    try {
      await addDoc(collection(db, 'notifications'), notificationData);
    } catch (e) {
      console.error('Error saving comment notification to Firestore:', e);
    }
  }
}

export default NotificationAPI;
