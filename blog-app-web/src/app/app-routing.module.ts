import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CategoriesListComponent } from './components/categories-list/categories-list.component';
import { AddCategoryComponent } from './components/add-category/add-category.component';
import { EditCategoryComponent } from './components/edit-category/edit-category.component';
import { AddBlogpostComponent } from './components/add-blogpost/add-blogpost.component';
import { BlogpostListComponent } from './components/blogpost-list/blogpost-list.component';
import { HomeComponent } from './components/home/home.component';
import { BlogpostDetailsComponent } from './components/blogpost-details/blogpost-details.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './services/guard/auth.guard';
import { EditBlogPostComponent } from './components/edit-blogpost/edit-blogpost.component';
import { ProfileComponent } from './components/profile/profile.component';
import { EditProfileComponent } from './components/profile/edit-profile/edit-profile.component';

export const routes: Routes = [
  {
    path: 'admin/categories',
    component: CategoriesListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/categories/add',
    component: AddCategoryComponent
  },
  {
    path: 'admin/categories/edit/:id',
    component: EditCategoryComponent
  },
  {
    path: 'admin/blogposts',
    component: BlogpostListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'admin/blogposts/add',
    component: AddBlogpostComponent
  },
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  { path: 'admin/blogposts/edit/:id', component: EditBlogPostComponent, canActivate: [AuthGuard] },
  {
    path: 'blog/:urlHandle',
    component: BlogpostDetailsComponent
  },
  { path: 'profile', component: ProfileComponent /*, canActivate: [AuthGuard]*/ },
    { path: 'profile/edit', component: EditProfileComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
