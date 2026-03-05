import { Routes } from '@angular/router';
import { RequestListComponent } from './components/request-list/request-list.component';
import { RequestDetailComponent } from './components/request-detail/request-detail.component';
import { ScriptListComponent } from './components/script-list/script-list.component';
import { CategoryViewComponent } from './components/category-view/category-view.component';

export const routes: Routes = [
  { path: '', component: RequestListComponent },
  { path: 'request/:reqid', component: RequestDetailComponent },
  { path: 'scripts', component: ScriptListComponent },
  { path: 'categories', component: CategoryViewComponent },
  { path: '**', redirectTo: '' },
];
