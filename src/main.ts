import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { enableProdMode, isDevMode, runInInjectionContext, EnvironmentInjector, importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
// 🔒 في حالة الإنتاج، فعّل وضع الإنتاج لتقليل التحذيرات
if (!isDevMode()) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...appConfig.providers,
    importProvidersFrom(BrowserAnimationsModule, ToastModule),
    MessageService
  ]
})
  .then(appRef => {
    const injector = appRef.injector.get(EnvironmentInjector);

    // 🔥 تشغيل داخل الـ context
    runInInjectionContext(injector, () => {
      const messageService = injector.get(MessageService);
      messageService.add({
        severity: 'success',
        summary: 'website Started',
        detail: 'Your website working good 🎉'
      });
    });
  })
  .catch(err => console.error('❌ Bootstrap error:', err));
