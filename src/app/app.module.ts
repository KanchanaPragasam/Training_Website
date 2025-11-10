import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';

import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { QuillModule } from 'ngx-quill';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormComponent } from './components/form/form.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FaqComponent } from './components/faq/faq.component';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input'; 
import { MatNativeDateModule } from '@angular/material/core'; 
import { RecaptchaModule } from 'ng-recaptcha';
import { EnquiryBotComponent } from './components/enquiry-bot/enquiry-bot.component';
import { MAT_DATE_FORMATS, DateAdapter } from '@angular/material/core';
import { OrdinalDateAdapter } from './shared/pipes/ordinal-date-adapter';
import { CUSTOM_DATE_FORMATS } from './shared/pipes/custom-date-format';
import { AppComponent } from './app.component';

import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';






@NgModule({
  declarations: [
    AppComponent,
    FormComponent,
    FaqComponent,
    EnquiryBotComponent,
    
  ],
  imports: [
    BrowserModule,
    NgxIntlTelInputModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
    HttpClientModule,
    MatFormFieldModule,
    MatNativeDateModule,
    BrowserAnimationsModule,
    QuillModule.forRoot(),
     MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
     RecaptchaModule,
     NgbCarouselModule
  ],
  providers: [
       { provide: DateAdapter, useClass: OrdinalDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    provideClientHydration(withEventReplay())
  ],
  bootstrap: [AppComponent]

})
export class AppModule { }