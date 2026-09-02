import type { Metadata } from "next";

import { createPublicClient } from "../../lib/auth/api-auth";
import {
  getPublicUserProfileByUsername,
  listUserLibraryPapers,
} from "../../lib/papers/store";
import UserLibraryClient from "./UserLibraryClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username}'s Library — BioLayers AI`,
    description: `Explore cancer biology mind maps and research literature analyzed by @${username} on BioLayers AI.`,
  };
}

export default async function UserLibraryPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = createPublicClient();
  const profile = await getPublicUserProfileByUsername(supabase, username);

  const initialPapers = profile
    ? await listUserLibraryPapers(supabase, profile.id, {
        limit: 20,
        offset: 0,
      })
    : [];

  const effectiveProfile = profile ?? {
    id: "",
    fullName: username,
    avatarUrl: null,
    username: username,
  };

  return (
    <UserLibraryClient
      profile={effectiveProfile}
      initialPapers={initialPapers}
      username={username}
      userNotFound={!profile}
    />
  );
}