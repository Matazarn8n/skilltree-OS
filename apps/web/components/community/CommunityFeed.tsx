"use client";

import { useState } from "react";
import { Composer } from "./Composer";
import { PostCard } from "./PostCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { COMMUNITY_POSTS, type CommunityPost } from "@/lib/community-data";

let nextId = COMMUNITY_POSTS.length + 1;

export function CommunityFeed() {
  const [posts, setPosts] = useState<CommunityPost[]>(COMMUNITY_POSTS);

  function handlePublish(content: string) {
    const post: CommunityPost = {
      id: String(nextId++),
      author: "Toi",
      initials: "TO",
      timeAgo: "à l'instant",
      content,
      reactions: 0,
    };
    setPosts((prev) => [post, ...prev]);
  }

  return (
    <div className="flex flex-col gap-6">
      <Composer onPublish={handlePublish} />
      {posts.length === 0 ? (
        <EmptyState title="Aucun post pour l'instant" hint="Sois le premier à partager quelque chose." />
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <PostCard key={post.id} {...post} />
          ))}
        </div>
      )}
    </div>
  );
}
