import { useEffect, useState } from 'react';

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';

import { auth, db } from '../firebase';

function Messages() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');



  useEffect(() => {
    const unsubscribeAuth =
      auth.onAuthStateChanged((currentUser) => {
        if (!currentUser) {
          setMessages([]);
          setLoading(false);
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

        const unsubscribeMessages = onSnapshot(
          messagesQuery,
          async (snapshot) => {
            const messagesList =
              snapshot.docs
                .map((messageDocument) => ({
                  id: messageDocument.id,
                  ...messageDocument.data(),
                }))
                .sort((firstMessage, secondMessage) => {
                  const firstTime =
                    firstMessage.createdAt?.toMillis?.() ||
                    0;

                  const secondTime =
                    secondMessage.createdAt?.toMillis?.() ||
                    0;

                  return firstTime - secondTime;
                });

            setMessages(messagesList);
            setLoading(false);

            const unreadAdminMessages =
              snapshot.docs.filter(
                (messageDocument) => {
                  const message =
                    messageDocument.data();

                  return (
                    message.senderRole === 'admin' &&
                    message.read === false
                  );
                }
              );

            try {
              await Promise.all(
                unreadAdminMessages.map(
                  (messageDocument) =>
                    updateDoc(
                      doc(
                        db,
                        'messages',
                        messageDocument.id
                      ),
                      {
                        read: true,
                        readAt: serverTimestamp(),
                      }
                    )
                )
              );
            } catch (readError) {
              console.error(
                'Greška pri označavanju poruke:',
                readError
              );
            }

            
          },
          (snapshotError) => {
            console.error(
              'Greška pri učitavanju poruka:',
              snapshotError
            );

            setError(
              snapshotError.message ||
                'Poruke se ne mogu učitati.'
            );

            setLoading(false);
          }
        );

        return unsubscribeMessages;
      });

    return () => unsubscribeAuth();
  }, []);

  const sendMessage = async (event) => {
    event.preventDefault();

    const currentUser = auth.currentUser;
    const messageText = newMessage.trim();

    if (!currentUser) {
      setError(
        'Morate biti prijavljeni za slanje poruke.'
      );
      return;
    }

    if (!messageText) {
      return;
    }

    try {
      setSending(true);
      setError('');

      await addDoc(
        collection(db, 'messages'),
        {
          userId: currentUser.uid,
          userEmail: currentUser.email || '',
          senderId: currentUser.uid,
          senderRole: 'customer',
          text: messageText,
          orderId: '',
          read: true,
          createdAt: serverTimestamp(),
        }
      );

      setNewMessage('');
    } catch (sendError) {
      console.error(
        'Greška pri slanju poruke:',
        sendError
      );

      setError(
        sendError.message ||
          'Poruka nije poslana.'
      );
    } finally {
      setSending(false);
    }
  };

  const formatDate = (timestamp) => {
    if (
      timestamp &&
      typeof timestamp.toDate === 'function'
    ) {
      return timestamp.toDate().toLocaleString(
        'bs-BA',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }
      );
    }

    return 'Upravo sada';
  };

  if (loading) {
    return (
      <section className="messages-card">
        <p>Učitavanje poruka...</p>
      </section>
    );
  }

  return (
    <section className="messages-card">
      <div className="messages-header">
        <div>
          <h2 className="messages-title">
            Poruke
          </h2>

          <p className="messages-subtitle">
            Obavijesti administratora i poruke
            korisničkoj podršci.
          </p>
        </div>

        <span className="messages-icon">
          💬
        </span>
      </div>

      {error && (
        <div className="auth-error" role="alert">
          ⚠️ {error}
        </div>
      )}

      <div className="messages-list">
        {messages.length === 0 ? (
          <div className="messages-empty">
            <div className="messages-empty-icon">
              💭
            </div>

            <p>
              Trenutno nemate poruka.
            </p>
          </div>
        ) : (
          messages.map((message) => {
            const fromAdmin =
              message.senderRole === 'admin' ||
              message.sender === 'admin';

            return (
              <div
                key={message.id}
                className={`message-bubble ${
                  fromAdmin
                    ? 'message-from-admin'
                    : 'message-from-customer'
                }`}
              >
                <div className="message-bubble-top">
                  <span className="message-sender">
                    {fromAdmin
                      ? 'LayerLab3D'
                      : 'Vi'}
                  </span>

                  <span className="message-date">
                    {formatDate(
                      message.createdAt
                    )}
                  </span>
                </div>

                <p className="message-text">
                  {message.text}
                </p>
              </div>
            );
          })
        )}

      
      </div>

      <form
        onSubmit={sendMessage}
        className="message-form"
      >
        <label
          htmlFor="customer-message"
          className="form-label"
        >
          Vaša poruka
        </label>

        <textarea
          id="customer-message"
          className="form-textarea"
          value={newMessage}
          onChange={(event) =>
            setNewMessage(event.target.value)
          }
          placeholder="Napišite pitanje ili poruku..."
          rows="4"
          required
        />

        <button
          type="submit"
          className="form-button"
          disabled={
            sending || !newMessage.trim()
          }
        >
          {sending
            ? 'Slanje...'
            : 'Pošalji poruku'}
        </button>
      </form>
    </section>
  );
}

export default Messages;