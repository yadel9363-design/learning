import { Routes } from '@angular/router';
import { ProductsComponent } from './core/products/component/products.component';
import { MyOrdersComponent } from './core/my-orders/component/my-orders.component';
import { AdminOrdersComponent } from './core/admin/admin-orders/admin-orders.component';
import { AdminProductsComponent } from './core/admin/admin-products/admin-products.component';
import { NotFoundComponent } from './core/not-found/not-found.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './core/home/component/home.component';
import { AuthGuard } from './shared/services/auth-guard.service';
import { UserAuthGuard } from './shared/services/user-auth-guard.service';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './layout/profile/components/profile.component';
import { favouriteComponent } from './core/favourite/favourite.component';
import { activities } from './core/activities/activities.component';
import { ChardetailsComponent } from './core/chardetails/chardetails.component';
import { CoursesComponent } from './core/courses/components/courses.component';


export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'products', component: ProductsComponent, canActivate: [AuthGuard] },
  { path: 'courses', component: CoursesComponent, canActivate: [AuthGuard] },
  { path: 'activities', component: activities, canActivate: [AuthGuard] },
  { path: 'orders', component: MyOrdersComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
    children: [
      {
          path: 'chardetails/:id', component: ChardetailsComponent, canActivate: [AuthGuard] ,
      }
    ]
    },
  { path: 'favourite', component: favouriteComponent, canActivate: [AuthGuard] },
  { path: 'admin/orders', component: AdminOrdersComponent,
      canActivate: [AuthGuard, UserAuthGuard] },
  { path: 'admin/products', component: AdminProductsComponent,
      canActivate: [AuthGuard, UserAuthGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent, canActivate: [AuthGuard] } // not found page
];
