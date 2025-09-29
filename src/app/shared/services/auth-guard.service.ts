import { Injectable, inject, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Auth, authState } from '@angular/fire/auth';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private auth = inject(Auth);
  private router = inject(Router);
  private injector = inject(EnvironmentInjector);

  async canActivate(): Promise<boolean | UrlTree> {
    // نشغّل authState داخل Injection Context لتجنّب التحذيرات المتعلقة بالـ Zone/Injection
    const user = await runInInjectionContext(this.injector, () =>
      firstValueFrom(authState(this.auth))
    );

    return user ? true : this.router.createUrlTree(['/login']);
  }
}
