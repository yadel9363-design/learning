export interface AppUser {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  providerId?: string;
  phoneNumber?: string;
  gender?: string;
  isAdmin?: boolean;
}
