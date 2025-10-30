export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
  providerId?: string;
  phoneNumber?: string | null;
  gender?: string | null;
  isAdmin?: boolean;
  interests?: string[];
  offerClaimed: boolean
}
