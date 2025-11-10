import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoursesRoutingModule } from './courses-routing.module';
import { CourseDetailsComponent } from './course-details/course-details.component';
import { CourseListComponent } from './course-list/course-list.component';
import { SharedModule } from '../../shared/shared.module';
import { QuillModule } from 'ngx-quill';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormComponent } from '../form/form.component';

@NgModule({
  declarations: [

    CourseDetailsComponent,
    CourseListComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    CoursesRoutingModule,
    ReactiveFormsModule,
    NgSelectModule,
    QuillModule.forRoot(),

   
    
  ]
})
export class CoursesModule { }
