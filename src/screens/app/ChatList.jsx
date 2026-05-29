import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppHeader from '../../components/layout/AppHeader';
import AvatarImage from '../../components/ui/AvatarImage';
import { useAuth } from '../../hooks/useAuth';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { fetchChatConversations } from '../../utils/chatStorage';
import { getSession } from '../../utils/storage';

function getCurrentUserId(user) {
  return user?.id || getSession()?.id || null;
}

export default function ChatList() {
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    const uid = getCurrentUserId(user);
    const list = await fetchChatConversations(uid);
    setConversations(list);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const uid = getCurrentUserId(user);
    if (!isSupabaseConfigured || !supabase || !uid) return undefined;

    const channel = supabase
      .channel(`chat-list-${uid}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadConversations]);

  const filtered = conversations.filter((c) =>
    c.prenom.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="chat-list-screen">
      <AppHeader showAvatar={false} />
      <h1 className="chat-list-title">Messages</h1>
      <div className="chat-search">
        <span aria-hidden>🔍</span>
        <input
          placeholder="Rechercher"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      {loading ? (
        <p className="likes-empty-sub" style={{ padding: 24, textAlign: 'center' }}>
          Chargement…
        </p>
      ) : filtered.length === 0 ? (
        <div className="likes-empty">
          <div className="likes-empty-icon">💬</div>
          <p className="likes-empty-title">Aucune conversation</p>
          <p className="likes-empty-sub">Fais un match pour commencer à discuter</p>
        </div>
      ) : (
        <ul className="chat-conversations">
          {filtered.map((c) => (
            <li key={c.id}>
              <Link to={`/chat/${c.id}`} className="chat-row">
                <AvatarImage src={c.photo} name={c.prenom} size={48} />
                <div className="chat-row__body">
                  <div className="chat-row__top">
                    <strong>{c.prenom}</strong>
                    <span className="chat-row__time">{c.time}</span>
                  </div>
                  <p className="chat-row__last">{c.last}</p>
                </div>
                {c.unread > 0 && <span className="chat-unread">{c.unread}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
