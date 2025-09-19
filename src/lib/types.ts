export type Snapshot = {
    profileId: string | null;
    email: string | null;
    displayName?: string | null;
    leafTotal: number;
    perks: any[];
    unlocked: { fund?: boolean; market?: boolean };
    avatarUrl?: string | null;
    planetColor?: string | null;
  };