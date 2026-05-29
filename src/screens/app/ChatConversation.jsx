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
  loadChatMessages,
  pickAutoReply,
  saveChatMessages,
  sendChatMessage,
  subscribeToMatchMessages,
} from '../../utils/chatStorage';
import { getSession } from '../../utils/storage';

function getCurrentUserId(user) {
  return user?.id || getSession()?.id || null;
}

export default function ChatConversation() {
  const { id: matchId } = useParams();
  const { user } = useAuth();
  const currentUserId = getCurrentUserId(user);

  const [participant, setParticipant] = useState({ prenom: 'Sportif', photo: '' });
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const replyTimer = useRef(null);
  const bottomRef = useRef(null);
  const messageIdsRef = useRef(new Set());

  const syncMessageIds = useCallback((list) => {
    messageIdsRef.current = new Set(list.map((m) => m.id));
  }, []);

  const loadThread = useCallback(async () => {
    if (!matchId) return;
    setLoading(true);
    const [participantInfo, msgs] = await Promise.all([
      fetchMatchParticipant(matchId, currentUserId),
      fetchMessages(matchId, currentUserId),
    ]);
    setParticipant(participantInfo);
    setMessages(msgs);
    syncMessageIds(msgs);
    setLoading(false);
  }, [matchId, currentUserId, syncMessageIds]);

  useEffect(() => {
    loadThread();
  }, [loadThread]);

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

  useEffect(
    () => () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    },
    []
  );

  const send = async () => {
    const content = text.trim();
    if (!content || !matchId) return;

    setText('');

    if (isSupabaseConfigured && currentUserId) {
      const sent = await sendChatMessage(matchId, currentUserId, content);
      if (sent) {
        if (!messageIdsRef.current.has(sent.id)) {
          messageIdsRef.current.add(sent.id);
          setMessages((prev) => [...prev, sent]);
        }
      }
      return;
    }

    const myMsg = {
      id: Date.now(),
      sender: 'me',
      content,
      time: Date.now(),
    };
    const next = [...messages, myMsg];
    setMessages(next);
    saveChatMessages(matchId, next);
    messageIdsRef.current.add(myMsg.id);

    if (replyTimer.current) clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      setMessages((current) => {
        const reply = {
          id: Date.now() + 1,
          sender: 'other',
          content: pickAutoReply(),
          time: Date.now(),
        };
        const updated = [...current, reply];
        saveChatMessages(matchId, updated);
        return updated;
      });
    }, 1500);
  };

  return (
    <div className="app-frame app-frame--fixed chat-conversation">
      <OfflineBanner />
      <header className="chat-conv-header">
        <BackButton />
        <AvatarImage src={participant.photo} name={participant.prenom} size={40} />
        <span className="chat-conv-name">{participant.prenom}</span>
      </header>
      <div className="chat-messages">
        {loading ? (
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
          disabled={loading}
        />
        <button type="button" onClick={send} aria-label="Envoyer" disabled={loading}>
          ↑
        </button>
      </div>
    </div>
  );
}
