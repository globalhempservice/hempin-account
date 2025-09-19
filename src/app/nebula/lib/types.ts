// Minimal shared types for Nebula components.
// Keep tiny on purpose; expand as we add features.

export type Snapshot = {
    profileId: string | null;
    email: string | null;
    leafTotal: number;
    perks: any[];
    unlocked: {
      fund?: boolean;
      market?: boolean;
    };
  };
  
  export type ProfileBasics = {
    avatar_url: string | null;
    planet_color: string | null;
    display_name?: string | null;
  };