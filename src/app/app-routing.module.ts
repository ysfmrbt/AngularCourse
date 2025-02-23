import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MemberComponent } from './member/member.component';
import { MemberFormComponent } from './member-form/member-form.component';
import { ToolsComponent } from './tools/tools.component';
import { ArticlesComponent } from './articles/articles.component';
import { EventsComponent } from './events/events.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  {
    path: 'members',
    pathMatch: 'full',
    component: MemberComponent,
  },
  {
    path: 'dashboard',
    pathMatch: 'full',
    component: DashboardComponent,
  },
  {
    path: 'tools',
    pathMatch: 'full',
    component: ToolsComponent,
  },
  {
    path: 'articles',
    pathMatch: 'full',
    component: ArticlesComponent,
  },
  {
    path: 'events',
    pathMatch: 'full',
    component: EventsComponent,
  },
  {
    path: 'create',
    pathMatch: 'full',
    component: MemberFormComponent,
  },
  {
    path: 'delete/:id',
    pathMatch: 'full',
    component: MemberComponent,
  },
  {
    path: 'edit/:id',
    pathMatch: 'full',
    component: MemberFormComponent,
  },
  {
    path: '**',
    component: MemberComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
