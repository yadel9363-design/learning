import { Routes } from '@angular/router';
import { ProductsComponent } from './core/products/products.component';
import { MyOrdersComponent } from './core/my-orders/my-orders.component';
import { AdminOrdersComponent } from './core/admin/admin-orders/admin-orders.component';
import { AdminProductsComponent } from './core/admin/admin-products/admin-products.component';
import { AppComponent } from './app.component';
import { NotFoundComponent } from './core/not-found/not-found.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './core/home/home.component';


export const routes: Routes = [
    { path: 'products', component: ProductsComponent },
    { path: 'home', component: HomeComponent },
    { path: 'orders', component: MyOrdersComponent },
    { path: 'login', component: LoginComponent },
    { path: 'admin/orders', component: AdminOrdersComponent },
    { path: 'admin/products', component: AdminProductsComponent },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', component: NotFoundComponent } // not found page
];
