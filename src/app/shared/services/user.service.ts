import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import { Database, ref, set } from '@angular/fire/database';
import { User } from 'firebase/auth';

@Injectable({ providedIn: 'root' })
export class UserService {
  private db = inject(Database);
  private envInjector = inject(EnvironmentInjector);
  user$: any;

  save(user: User) {
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      providerId: user.providerData[0]?.providerId || 'unknown'
    };

    runInInjectionContext(this.envInjector, () => {
      set(ref(this.db, 'users/' + user.uid), userData);
    });
  }
}
