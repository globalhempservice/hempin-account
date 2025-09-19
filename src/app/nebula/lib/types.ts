// Minimal shared types for Nebula components + profile edit.

export type SocialLink =
  | { type: 'website'|'instagram'|'linkedin'|'x'|'custom'; url: string; label?: string };

export type Snapshot = {
  profileId: string | null;
  email: string | null;
  leafTotal: number;
  unlocked: { fund?: boolean; market?: boolean };
  // enriched for the nebula planet
  avatarUrl?: string | null;
  planetColor?: string | null;
};

export type ProfileBasics = {
  real_name?: string | null;
  display_name?: string | null;
  bio?: string | null;
  country?: string | null;   // free text or ISO code
  role?: string | null;      // free text for now
  links?: SocialLink[];      // JSONB array
  avatar_url?: string | null;
  planet_color?: string | null;
};