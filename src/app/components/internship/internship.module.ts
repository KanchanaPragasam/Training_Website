import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { InternshipRoutingModule } from './internship-routing.module';
import { InternshipComponent } from './internship.component';


@NgModule({
  declarations: [
    InternshipComponent
  ],
  imports: [
    CommonModule,
    InternshipRoutingModule,
    MatExpansionModule,      // For mat-accordion and mat-expansion-panel
    MatButtonModule 
  ]
})
export class InternshipModule { }
