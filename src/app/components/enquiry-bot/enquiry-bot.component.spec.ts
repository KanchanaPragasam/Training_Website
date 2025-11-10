import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnquiryBotComponent } from './enquiry-bot.component';

describe('EnquiryBotComponent', () => {
  let component: EnquiryBotComponent;
  let fixture: ComponentFixture<EnquiryBotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EnquiryBotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnquiryBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
