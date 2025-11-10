import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactService } from '../../core/services/contact.service';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-enquiry-bot',
  standalone: false,
  templateUrl: './enquiry-bot.component.html',
  styleUrls: ['./enquiry-bot.component.scss']
})
export class EnquiryBotComponent implements OnInit, OnDestroy {

  isPopupVisible = false;
  isClosing = false;
  showScrollTop = false;

  enquiryForm!: FormGroup;
  message: string = '';

  popupTimer: any = null;
  popupShown: boolean = false;

  quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }]
    ]
  };
  isBrowser = false;
  private routerSub!: Subscription;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private contactService: ContactService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) { }

  /** ------------------- Lifecycle ------------------- */
  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.initForm();
      window.addEventListener('scroll', this.scrollHandler);
    }

    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => this.handleRouteChange(event.urlAfterRedirects));
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {

      window.removeEventListener('scroll', this.scrollHandler);
      if (this.routerSub) this.routerSub.unsubscribe();
      if (this.popupTimer) clearTimeout(this.popupTimer);
    }
  }

  /** ------------------- Scroll ------------------- */
  private scrollHandler = () => {
    this.showScrollTop = window.scrollY > 300;
  };

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /** ------------------- Form ------------------- */
  private initForm(): void {
    this.enquiryForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]{2,30}$')]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      enquiryType: ['', [Validators.required]],
      message: ['', [Validators.required, this.quillContentValidator]]
    });
  }

  /** Custom validator to ensure quill content is not empty */
  quillContentValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    const trimmed = value.replace(/<(.|\n)*?>/g, '').trim();
    return trimmed.length === 0 ? { required: true } : null;
  }

  /** ------------------- Popup ------------------- */
  togglePopup(): void {
    if (this.isPopupVisible) {
      this.isClosing = true;
      setTimeout(() => {
        this.isPopupVisible = false;
        this.isClosing = false;
      }, 1000);
    } else {
      this.isPopupVisible = true;
    }
  }

  private showPopup(): void {
    this.isPopupVisible = true;
    this.isClosing = false;
  }

  /** ------------------- Router Popup Logic ------------------- */
  private handleRouteChange(currentRoute: string) {
    // Clear previous timer
    if (this.popupTimer) {
      clearTimeout(this.popupTimer);
      this.popupTimer = null;
    }

    if (this.popupShown) return; // Already shown
    if (currentRoute === '/form' || currentRoute.startsWith('/form?')) {
      this.isPopupVisible = false; // Do not show on form page
      return;
    }

    // Show popup after 10 seconds
    if (this.isBrowser) {
      this.popupTimer = setTimeout(() => {
        this.showPopup();
        this.popupShown = true;
        this.popupTimer = null;
      }, 10000);
    }

  }

  /** ------------------- Form Submission ------------------- */
  sendEnquiry(): void {
    // Update Quill content in form control for validation
    this.enquiryForm.get('message')?.setValue(this.message);

    if (this.enquiryForm.invalid) {
      this.snackBar.open('Please fill all required fields correctly.', undefined, {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar-error']
      });
      return;
    }

    const enquiryData = this.enquiryForm.value;

    this.contactService.sendMail(enquiryData, 'enquiry').subscribe({
      next: () => {
        this.snackBar.open('Enquiry sent successfully!', undefined, {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['custom-snackbar']
        });
        this.enquiryForm.reset();
        this.message = '';
        this.isPopupVisible = false;
      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to send enquiry. Try again.', undefined, {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['custom-snackbar-error']
        });
      }
    });
  }
}
