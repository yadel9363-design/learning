import { Routes } from '@angular/router';
import { ProductsComponent } from './core/products/component/products.component';
import { MyOrdersComponent } from './core/my-orders/component/my-orders.component';
import { AdminOrdersComponent } from './core/admin/admin-orders/admin-orders.component';
import { AdminProductsComponent } from './core/admin/admin-products/admin-products.component';
import { NotFoundComponent } from './core/not-found/not-found.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './core/home/home.component';
import { AuthGuard } from './shared/services/auth-guard.service';
import { UserAuthGuard } from './shared/services/user-auth-guard.service';
import { RegisterComponent } from './register/register.component';


export const routes: Routes = [
    { path: 'products', component: ProductsComponent, canActivate: [AuthGuard] },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'orders', component: MyOrdersComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'admin/orders', component: AdminOrdersComponent,
       canActivate: [AuthGuard, UserAuthGuard] },
    { path: 'admin/products', component: AdminProductsComponent,
       canActivate: [AuthGuard, UserAuthGuard] },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', component: NotFoundComponent, canActivate: [AuthGuard] } // not found page
];
