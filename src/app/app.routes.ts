import { Routes } from '@angular/router';
import { RequestListComponent } from './components/request-list/request-list.component';
import { RequestDetailComponent } from './components/request-detail/request-detail.component';
import { ScriptListComponent } from './components/script-list/script-list.component';
import { CategoryViewComponent } from './components/category-view/category-view.component';
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: RequestListComponent, canActivate: [authGuard] },
  { path: 'request/:reqid', component: RequestDetailComponent, canActivate: [authGuard] },
  { path: 'scripts', component: ScriptListComponent, canActivate: [authGuard] },
  { path: 'categories', component: CategoryViewComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
