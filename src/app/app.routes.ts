import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EventsComponent } from './events/events.component';
import { MemberComponent } from './member/member.component';
import { MemberDetailsComponent } from './member-details/member-details.component';
import { PublicationAssignmentComponent } from './publication-assignment/publication-assignment.component';
import { ToolsComponent } from './tools/tools.component';
import { ArticlesComponent } from './articles/articles.component';
import { TemplateComponent } from './template/template.component';
import { LoginComponent } from './login/login.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: TemplateComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'members', component: MemberComponent },
      { path: 'member-details/:id', component: MemberDetailsComponent },
      { path: 'publication-assignment', component: PublicationAssignmentComponent },
      { path: 'events', component: EventsComponent },
      { path: 'tools', component: ToolsComponent },
      { path: 'articles', component: ArticlesComponent },
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
