import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import BackButton from '../../components/ui/BackButton';
import AvatarImage from '../../components/ui/AvatarImage';
import OfflineBanner from '../../components/ui/OfflineBanner';
import { useAuth } from '../../hooks/useAuth';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  fetchMatchParticipant,
  fetchMessages,
  sendChatMessage,
  subscribeToMatchMessages,
} from '../../utils/chatStorage';
function getCurrentUserId(user) {
  return user?.id ?? null;
}

export default function ChatConversation() {
  const { id: matchId } = useParams();
  const { user } = useAuth();
  const currentUserId = getCurrentUserId(user);

  const [participant, setParticipant] = useState({ prenom: 'Sportif', photo: '' });
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const bottomRef = useRef(null);
  const messageIdsRef = useRef(new Set());

  const syncMessageIds = useCallback((list) => {
    messageIdsRef.current = new Set(list.map((m) => m.id));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!matchId) return;
      setLoading(true);
      const [participantInfo, msgs] = await Promise.all([
        fetchMatchParticipant(matchId, currentUserId),
        fetchMessages(matchId, currentUserId),
      ]);
      if (cancelled) return;
      setParticipant(participantInfo);
      setMessages(msgs);
      syncMessageIds(msgs);
      setLoading(false);
    };
    run();
    return () => { cancelled = true; };
  }, [matchId, currentUserId, syncMessageIds]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!matchId || !currentUserId) return undefined;

    const unsubscribe = subscribeToMatchMessages(matchId, currentUserId, (msg) => {
      if (messageIdsRef.current.has(msg.id)) return;
      messageIdsRef.current.add(msg.id);
      setMessages((prev) => [...prev, msg]);
    });

    return unsubscribe;
  }, [matchId, currentUserId]);

  const send = async () => {
    const content = text.trim();
    if (!content || !matchId || !isSupabaseConfigured || !currentUserId) return;

    setText('');

    const sent = await sendChatMessage(matchId, currentUserId, content);
    if (sent && !messageIdsRef.current.has(sent.id)) {
      messageIdsRef.current.add(sent.id);
      setMessages((prev) => [...prev, sent]);
    }
  };

  const chatUnavailable = !isSupabaseConfigured || !currentUserId;

  return (
    <div className="app-frame app-frame--fixed chat-conversation">
      <OfflineBanner />
      <header className="chat-conv-header">
        <BackButton />
        <AvatarImage src={participant.photo} name={participant.prenom} size={40} />
        <span className="chat-conv-name">{participant.prenom}</span>
      </header>
      <div className="chat-messages">
        {chatUnavailable ? (
          <p className="likes-empty-sub" style={{ textAlign: 'center', padding: 24 }}>
            Chat indisponible.
          </p>
        ) : loading ? (
          <p className="likes-empty-sub" style={{ textAlign: 'center', padding: 24 }}>
            Chargement…
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`chat-bubble ${msg.sender === 'me' ? 'chat-bubble--sent' : 'chat-bubble--recv'}`}
            >
              {msg.content}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-bar">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Écrire un message…"
          onKeyDown={(e) => e.key === 'Enter' && send()}
          disabled={loading || chatUnavailable}
        />
        <button type="button" onClick={send} aria-label="Envoyer" disabled={loading || chatUnavailable}>
          ↑
        </button>
      </div>
    </div>
  );
}
