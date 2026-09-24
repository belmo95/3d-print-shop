import { useEffect, useState } from 'react';

import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';

import { onAuthStateChanged } from 'firebase/auth';

import { auth, db } from '../firebase';

function UserNotifications() {
  const [notificationCount, setNotificationCount] =
    useState(0);

  useEffect(() => {
    let unsubscribeMessages = null;
    let unsubscribeOrders = null;

    let messages = [];
    let orders = [];

    const calculateNotifications = () => {
      const unreadMessages = messages.filter(
        (message) =>
          message.senderRole === 'admin' &&
          message.read === false
      ).length;

      const unreadOrders = orders.filter(
        (order) =>
          order.hasNotification === true ||
          order.statusChanged === true ||
          order.readByCustomer === false
      ).length;

      setNotificationCount(
        unreadMessages + unreadOrders
      );
    };

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          if (unsubscribeMessages) {
            unsubscribeMessages();
            unsubscribeMessages = null;
          }

          if (unsubscribeOrders) {
            unsubscribeOrders();
            unsubscribeOrders = null;
          }

          messages = [];
          orders = [];
          setNotificationCount(0);

          if (!currentUser) {
            return;
          }

          const messagesQuery = query(
            collection(db, 'messages'),
            where(
              'userId',
              '==',
              currentUser.uid
            )
          );

          unsubscribeMessages = onSnapshot(
            messagesQuery,
            (snapshot) => {
              messages = snapshot.docs.map(
                (messageDocument) =>
                  messageDocument.data()
              );

              calculateNotifications();
            },
            (error) => {
              console.error(
                'Greška pri praćenju poruka:',
                error
              );
            }
          );

          const ordersQuery = query(
            collection(db, 'orders'),
            where(
              'userId',
              '==',
              currentUser.uid
            )
          );

          unsubscribeOrders = onSnapshot(
            ordersQuery,
            (snapshot) => {
              orders = snapshot.docs.map(
                (orderDocument) =>
                  orderDocument.data()
              );

              calculateNotifications();
            },
            (error) => {
              console.error(
                'Greška pri praćenju narudžbi:',
                error
              );
            }
          );
        }
      );

    return () => {
      unsubscribeAuth();

      if (unsubscribeMessages) {
        unsubscribeMessages();
      }

      if (unsubscribeOrders) {
        unsubscribeOrders();
      }
    };
  }, []);

  if (notificationCount === 0) {
    return null;
  }

  return (
    <span
      className="notification-badge"
      aria-label={`${notificationCount} novih obavijesti`}
    >
      {notificationCount > 99
        ? '99+'
        : notificationCount}
    </span>
  );
}

export default UserNotifications;