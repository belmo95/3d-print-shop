import { useEffect, useState } from 'react';

import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';

import { auth, db } from '../firebase';

function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [selectedUserId, setSelectedUserId] =
    useState('');
  const [selectedUserEmail, setSelectedUserEmail] =
    useState('');
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const messagesQuery = query(
      collection(db, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messagesList =
          snapshot.docs.map(
            (messageDocument) => ({
              id: messageDocument.id,
              ...messageDocument.data(),
            })
          );

        setMessages(messagesList);
        setLoading(false);
      },
      (snapshotError) => {
        console.error(
          'Greška pri učitavanju admin poruka:',
          snapshotError
        );

        setError(
          snapshotError.message ||
            'Poruke se ne mogu učitati.'
        );

        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const conversations = messages.reduce(
    (conversationList, message) => {
      const existingConversation =
        conversationList.find(
          (conversation) =>
            conversation.userId === message.userId
        );

      if (existingConversation) {
        existingConversation.messages.push(message);
      } else {
        conversationList.push({
          userId: message.userId,
          userEmail: message.userEmail || '',
          messages: [message],
        });
      }

      return conversationList;
    },
    []
  );

  const selectedConversation =
    conversations.find(
      (conversation) =>
        conversation.userId === selectedUserId
    );

  const selectConversation = (conversation) => {
    setSelectedUserId(conversation.userId);
    setSelectedUserEmail(
      conversation.userEmail
    );
    setNewMessage('');
  };

  const sendAdminMessage = async (event) => {
    event.preventDefault();

    const currentUser = auth.currentUser;
    const messageText = newMessage.trim();

    if (
      !currentUser ||
      !selectedUserId ||
      !messageText
    ) {
      return;
    }

    try {
      setSending(true);
      setError('');

      await addDoc(
        collection(db, 'messages'),
        {
          userId: selectedUserId,
          userEmail: selectedUserEmail,
          senderId: currentUser.uid,
          senderRole: 'admin',
          text: messageText,
          orderId: '',
          read: false,
          createdAt: serverTimestamp(),
        }
      );

      setNewMessage('');
    } catch (sendError) {
      console.error(
        'Greška pri slanju admin poruke:',
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
      <div className="admin-messages-card">
        <p>Učitavanje poruka...</p>
      </div>
    );
  }

  return (
    <div className="admin-messages-card">
      <div className="admin-messages-header">
        <div>
          <h2>Poruke klijenata</h2>

          <p>
            Pregledajte razgovore i odgovorite
            klijentima.
          </p>
        </div>
      </div>

      {error && (
        <div className="admin-error" role="alert">
          ⚠️ {error}
        </div>
      )}

      <div className="admin-messages-layout">
        <div className="conversation-list">
          <h3>Klijenti</h3>

          {conversations.length === 0 ? (
            <p>Nema poruka klijenata.</p>
          ) : (
            conversations.map((conversation) => (
              <button
                type="button"
                key={conversation.userId}
                className={`conversation-item ${
                  selectedUserId ===
                  conversation.userId
                    ? 'active'
                    : ''
                }`}
                onClick={() =>
                  selectConversation(
                    conversation
                  )
                }
              >
                <span className="conversation-icon">
                  👤
                </span>

                <span className="conversation-info">
                  <strong>
                    {conversation.userEmail ||
                      'Klijent'}
                  </strong>

                  <small>
                    {conversation.messages.length}{' '}
                    poruka
                  </small>
                </span>
              </button>
            ))
          )}
        </div>

        <div className="admin-conversation">
          {!selectedConversation ? (
            <div className="conversation-placeholder">
              <span>💬</span>

              <p>
                Izaberite klijenta da biste vidjeli
                razgovor.
              </p>
            </div>
          ) : (
            <>
              <div className="conversation-header">
                <h3>
                  {selectedConversation.userEmail}
                </h3>
              </div>

              <div className="admin-message-list">
                {selectedConversation.messages.map(
                  (message) => (
                    <div
                      key={message.id}
                      className={`message-bubble ${
                        message.senderRole ===
                        'admin'
                          ? 'message-from-admin'
                          : 'message-from-customer'
                      }`}
                    >
                      <div className="message-bubble-top">
                        <span className="message-sender">
                          {message.senderRole ===
                          'admin'
                            ? 'Vi'
                            : 'Klijent'}
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
                  )
                )}
              </div>

              <form
                onSubmit={sendAdminMessage}
                className="message-form"
              >
                <textarea
                  className="form-textarea"
                  value={newMessage}
                  onChange={(event) =>
                    setNewMessage(
                      event.target.value
                    )
                  }
                  placeholder="Napišite odgovor klijentu..."
                  rows="4"
                  required
                />

                <button
                  type="submit"
                  className="form-button"
                  disabled={
                    sending ||
                    !newMessage.trim()
                  }
                >
                  {sending
                    ? 'Slanje...'
                    : 'Pošalji odgovor'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminMessages;