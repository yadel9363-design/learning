import { Routes } from '@angular/router';
import { ProductsComponent } from './core/products/products.component';
import { MyOrdersComponent } from './core/my-orders/my-orders.component';
import { AdminOrdersComponent } from './core/admin/admin-orders/admin-orders.component';
import { AdminProductsComponent } from './core/admin/admin-products/admin-products.component';
import { NotFoundComponent } from './core/not-found/not-found.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './core/home/home.component';
import { AuthGuard } from './shared/services/auth-guard.service';


export const routes: Routes = [
    { path: 'products', component: ProductsComponent, canActivate: [AuthGuard] },
    { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'orders', component: MyOrdersComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'admin/orders', component: AdminOrdersComponent, canActivate: [AuthGuard] },
    { path: 'admin/products', component: AdminProductsComponent, canActivate: [AuthGuard] },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', component: NotFoundComponent, canActivate: [AuthGuard] } // not found page
];
