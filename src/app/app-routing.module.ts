import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { FormComponent } from './components/form/form.component';
import { FaqComponent } from './components/faq/faq.component';


const routes: Routes = [

  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./components/home/home.module').then(m => m.HomeModule) },
  { path: 'courses', loadChildren: () => import('./components/courses/courses.module').then(m=>m.CoursesModule) },
  { path: 'about', loadChildren: () => import('./components/about/about.module').then(m => m.AboutModule) },
  {path:'contact',loadChildren:()=>import('./components/contact/contact.module').then(m=>m.ContactModule)},
  {path:'enrollment',component:FormComponent},
  {path:'faq',component:FaqComponent},

  { path: 'internship', loadChildren: () => import('./components/internship/internship.module').then(m => m.InternshipModule) },
  { path: '**', redirectTo: 'home' },
];
// 👇 extra router config
const routerOptions: ExtraOptions = {
  anchorScrolling: 'enabled',   // enables scrolling to fragment
  scrollOffset: [0, 70],        // adjust for sticky navbar height
  scrollPositionRestoration: 'enabled' // restores position on back/forward
};
@NgModule({
  imports: [RouterModule.forRoot(routes,routerOptions)],
  exports: [RouterModule]
})
export class AppRoutingModule { }