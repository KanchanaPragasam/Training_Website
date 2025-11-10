import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { CardComponent } from './card/card.component';
import { RouterModule } from '@angular/router';
import { AnimateOnScrollDirective } from './directives/animate-on-scroll.directive';
import { ToggleArrowDirective } from './directives/toggle-arrow.directive';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    CardComponent,
    AnimateOnScrollDirective,
    ToggleArrowDirective,
  ],
  imports: [
    CommonModule,
    RouterModule
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    CardComponent,
    AnimateOnScrollDirective
  ],
   providers: [
    CurrencyPipe
  ]
})
export class SharedModule { }