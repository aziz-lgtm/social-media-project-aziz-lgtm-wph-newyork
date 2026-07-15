"use client";

import { useCallback, useState } from "react";

export interface DmMessage {
  id: string;
  from: "me" | "them";
  text: string;
  createdAt: string;
}

export interface DmPeer {
  username: string;
  name: string;
  avatarUrl: string | null;
}

export interface DmConversation extends DmPeer {
  messages: DmMessage[];
}

type DmStore = Record<string, DmConversation>;

function storageKey(userId: number) {
  return `sociality_dm_${userId}`;
}

function loadStore(userId: number): DmStore {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const CANNED_REPLIES = [
  "Hey! Thanks for reaching out 👋",
  "Haha true",
  "Nice, let's catch up soon",
  "Yeah I saw that too",
  "Sounds good to me!",
  "Not gonna lie, that's pretty cool",
];

// DM is entirely local — no messaging endpoints exist, so this never
// reaches a server. userId arrives late (Redux hydrates after mount), so
// the store resyncs during render rather than in an effect.
export function useConversations(userId: number | undefined) {
  const [loadedFor, setLoadedFor] = useState(userId);
  const [store, setStore] = useState<DmStore>(() => (userId ? loadStore(userId) : {}));

  if (userId !== loadedFor) {
    setLoadedFor(userId);
    setStore(userId ? loadStore(userId) : {});
  }

  const ensureConversation = useCallback(
    (peer: DmPeer) => {
      setStore((prev) => {
        if (prev[peer.username]) return prev;
        const next = { ...prev, [peer.username]: { ...peer, messages: [] } };
        if (userId) localStorage.setItem(storageKey(userId), JSON.stringify(next));
        return next;
      });
    },
    [userId]
  );

  const sendMessage = useCallback(
    (peer: DmPeer, text: string) => {
      const mine: DmMessage = {
        id: crypto.randomUUID(),
        from: "me",
        text,
        createdAt: new Date().toISOString(),
      };

      setStore((prev) => {
        const existing = prev[peer.username] ?? { ...peer, messages: [] };
        const next: DmStore = {
          ...prev,
          [peer.username]: { ...existing, messages: [...existing.messages, mine] },
        };
        if (userId) localStorage.setItem(storageKey(userId), JSON.stringify(next));
        return next;
      });

      const reply = CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)];
      const delay = 900 + Math.random() * 1200;
      setTimeout(() => {
        const theirs: DmMessage = {
          id: crypto.randomUUID(),
          from: "them",
          text: reply,
          createdAt: new Date().toISOString(),
        };
        setStore((prev) => {
          const existing = prev[peer.username] ?? { ...peer, messages: [] };
          const next: DmStore = {
            ...prev,
            [peer.username]: { ...existing, messages: [...existing.messages, theirs] },
          };
          if (userId) localStorage.setItem(storageKey(userId), JSON.stringify(next));
          return next;
        });
      }, delay);
    },
    [userId]
  );

  return { conversations: store, loaded: loadedFor !== undefined, ensureConversation, sendMessage };
}
