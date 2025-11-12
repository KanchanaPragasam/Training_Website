/**
 * Enrollment Form Component
 * --------------------------------
 * Handles a 3-step multi-form enrollment workflow:
 *
 * 1️⃣ Personal Details Form
 * 2️⃣ Course / Internship Selection
 * 3️⃣ Acknowledgement & reCAPTCHA
 *
 * Core Features:
 *  Reactive Form validations (dynamic & conditional)
 *  Country dropdown with auto-prefix to mobile number
 *  Course service integration with auto-preselection
 *  Internship program filtering logic
 *  Resume file upload

 */

import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { allCountries } from 'country-telephone-data';
import { CourseService } from '../../core/services/course.service';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ContactService } from '../../core/services/contact.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { isPlatformBrowser, Location } from '@angular/common';
import { Program, Internship } from '../../core/models/internship-model';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-form',
  standalone: false,
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit, OnDestroy {

  /** ---------------------  FORM STEP & DATE STATE --------------------- */
  currentStep = 1;
  today: Date = new Date();

  /** Reactive form groups for stepper sections */
  personalForm!: FormGroup;
  courseForm!: FormGroup;
  acknowledgementForm!: FormGroup;

  /** ---------------------  COUNTRY DROPDOWN DATA --------------------- */
  /** Lists loaded from country-telephone-data package */
  countries: { name: string; iso2: string; dialCode: string }[] = [];
  filteredCountries: { name: string; iso2: string; dialCode: string }[] = [];
  selectedCountryName = '';
  mobilePrefix = '';
  showDropdown = false;

  /** ----------------  COURSE / INTERNSHIP DATA ---------------- */
  internshipPrograms: Program[] = [];
  availableInternships: Internship[] = [];

  /** Stream for dynamic course list */
  private allCoursesSubject = new BehaviorSubject<string[]>([]);
  allCourses$ = this.allCoursesSubject.asObservable();

  /**  Unsubscribe handler for RxJS streams */
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private location: Location,
    private courseService: CourseService,
    private contactService: ContactService,
    private seo: SeoService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  /**  Lifecycle Init */
  ngOnInit(): void {
     this.seo.updateMetaData({
    title: 'Enroll for IT Courses & Internships | Software Training Service',
    description: 'Apply now for Java, Python, Angular, and Web Development courses or internships at Your Academy, Ambattur. Get certified and boost your IT career.',
    image: 'https://wp4.inspirationcs.ca/assets/images/logo-croped.webp',
    url: 'https://wp4.inspirationcs.ca/enrollment',
    robots: 'index, follow',
    canonical: 'https://www.yourdomain.com/enrollment',
    schema: {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "Enrollment Form - IT Courses & Internships",
      "url": "/assets/images/logo-croped.webp",
      "description": "Register online for IT training courses and internships at Software Training Service, Ambattur. Learn Java, Python, Angular, C++, and more.",
      "publisher": {
        "@type": "Organization",
        "name": "Software Training Service",
        "logo": {
          "@type": "ImageObject",
          "url": "https://wp4.inspirationcs.ca/assets/images/logo-croped.webp"
        }
      },
      "potentialAction": {
        "@type": "Action",
        "name": "Submit Enrollment Form"
      }
    }
  });
    this.initForms();
    this.setupCountries();
    this.loadCoursesAndState();
    this.loadInternships();
    this.setupCourseTypeListener();
  }


  /**  Cleanup active subscriptions */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   *  Initialize Three Form Groups with Validations
   */
  private initForms(): void {
    this.personalForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]{2,30}$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]{1,30}$')]],
      gender: ['', Validators.required],
      dob: ['', [Validators.required, this.minimumAgeValidator(13)]], // Must be >= 13 years
      occupation: ['', Validators.required],
      address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      city: ['', [Validators.required, Validators.pattern('^[a-zA-Z\\s]{2,50}$')]],
      pincode: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9\\-\\s]{3,10}$')]],
      country: ['', [Validators.required, this.countryValidator()]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      email: ['', [Validators.required, Validators.email]],
      about: ['', [Validators.maxLength(500)]],
      resume: ['', [Validators.required]]
    });

    /** Conditional Validators added later */
    this.courseForm = this.fb.group({
      type: ['', Validators.required], // course | internship
      selectedCourse: [''],
      schedule: [''],
      plannedStart: [''],
      plannedEnd: [''],
      mode: [''],
      comments: [''],
      selectedProgram: [''],
      selectedInternship: ['']
    });

    this.acknowledgementForm = this.fb.group({
      declaration: [false, Validators.requiredTrue],
      recaptchaToken: ['', Validators.required]
    });
  }

  /**
   *  Populate Countries List + Auto-select India
   */
  private setupCountries(): void {
    this.countries = allCountries.map(c => ({
      name: c.name.split(' (')[0],
      iso2: c.iso2,
      dialCode: c.dialCode
    })).sort((a, b) => a.name.localeCompare(b.name));

    this.filteredCountries = [...this.countries];

    const defaultCountry = this.countries.find(c => c.iso2 === 'in');
    if (defaultCountry) {
      this.selectCountry(defaultCountry);
    }
  }

  /**
   *  Load Course List & Preselect if navigation state sends data
   */
  private loadCoursesAndState(): void {
    this.courseService.getCourseNames()
      .pipe(takeUntil(this.destroy$))
      .subscribe(names => {
        this.allCoursesSubject.next(names);

        let stateCourse: string | null = null;

        // ✅ Browser-only guard
        if (isPlatformBrowser(this.platformId)) {
          stateCourse = history.state?.selectedCourse || null;
        }

        if (stateCourse && names.includes(stateCourse)) {
          this.courseForm.patchValue({
            type: 'course',
            selectedCourse: stateCourse
          });
        }
      });
  }

  /**
   *  Load Internship Programs from API
   */
  private loadInternships(): void {
    this.courseService.getInternshipData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.internshipPrograms = data || [];
      });
  }

  /**
   *  Switch Validation Rules Based on "course" or "internship"
   */
  
  private setupCourseTypeListener(): void {
    this.courseForm.get('type')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(type => {
        const selectedCourse = this.courseForm.get('selectedCourse')!;
        const schedule = this.courseForm.get('schedule')!;
        const mode = this.courseForm.get('mode')!;
        const plannedStart = this.courseForm.get('plannedStart')!;
        const plannedEnd = this.courseForm.get('plannedEnd')!;
        const selectedProgram = this.courseForm.get('selectedProgram')!;
        const selectedInternship = this.courseForm.get('selectedInternship')!;

        /** Clear previous validators first */
        [
          selectedCourse, schedule, mode, plannedStart, plannedEnd,
          selectedProgram, selectedInternship
        ].forEach(c => c.clearValidators());

        if (type === 'course') {
          selectedCourse.setValidators([Validators.required]);
          schedule.setValidators([Validators.required]);
          mode.setValidators([Validators.required]);
          plannedStart.setValidators([Validators.required, this.startDateValidator()]);
          plannedEnd.setValidators([Validators.required, this.endDateAfterStartValidator('plannedStart')]);
          this.availableInternships = [];
        } else {
          selectedProgram.setValidators([Validators.required]);
          selectedInternship.setValidators([Validators.required]);
        }

        /** Revalidate updated controls */
        [
          selectedCourse, schedule, mode, plannedStart, plannedEnd,
          selectedProgram, selectedInternship
        ].forEach(c => c.updateValueAndValidity());
      });

    /** Re-check plannedEnd whenever plannedStart changes */
    this.courseForm.get('plannedStart')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.courseForm.get('plannedEnd')?.updateValueAndValidity();
      });
  }

  /**
   *  Apply available internships when a program is selected
   */
  onProgramChange(): void {
    const programName = this.courseForm.get('selectedProgram')?.value;
    const program = this.internshipPrograms.find(p => p.name === programName);
    this.availableInternships = program?.internships || [];
  }

  /** ----------------  VALIDATORS ---------------- */

  /** Age must be >= minAge */
  minimumAgeValidator(minAge: number): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return null;
      const dob = new Date(control.value);
      if (isNaN(dob.getTime())) return null;
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      if (
        today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() &&
          today.getDate() < dob.getDate())
      ) age--;
      return age >= minAge ? null : { minAge: true };
    };
  }

  /** Ensure country exists in list */
  private countryValidator(): ValidatorFn {
    return (control: AbstractControl) =>
      this.countries.some(c => c.name.toLowerCase() === String(control.value).toLowerCase())
        ? null : { invalidCountry: true };
  }

  /** Start date must not be in the past */
  startDateValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.value) return null;
      const selected = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today ? null : { invalidStartDate: true };
    };
  }

  /** End date must be after start date */
  endDateAfterStartValidator(start: string): ValidatorFn {
    return (control: AbstractControl) => {
      const startControl = control.parent?.get(start);
      if (!startControl?.value || !control.value) return null;
      return new Date(control.value) > new Date(startControl.value)
        ? null : { endDateBeforeStart: true };
    };
  }

  /**  Live country search input */
  onCountryInput(value: string): void {
    const keyword = value.toLowerCase();
    this.selectedCountryName = value;
    this.filteredCountries = keyword
      ? this.countries.filter(c => c.name.toLowerCase().includes(keyword))
      : [...this.countries];
    this.showDropdown = true;
  }

  /**  Set country and dialing prefix */
  selectCountry(country: any): void {
    this.selectedCountryName = country.name;
    this.mobilePrefix = `+${country.dialCode}`;
    this.personalForm.patchValue({ country: country.name });
    this.showDropdown = false;
  }

  hideDropdown(): void {
    setTimeout(() => this.showDropdown = false, 200);
  }
  /**  Format date to DD/MM/YYYY */
  private formatDateToDMY(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /** ----------------  STEPPER ---------------- */
  goToStep(step: number) {
    if (step === 1) {
      this.currentStep = 1;
    }

    //  Move to Step 2 only if Step 1 is valid
    if (step === 2 && this.personalForm.valid) {
      this.currentStep = 2;
    }

    //  Move to Step 3 only if Step 2 is valid
    if (step === 3 && this.courseForm.valid) {
      this.currentStep = 3;
    }
  }

  /** Go to next step after validation */
  nextStep(): void {
    if (this.currentStep === 1 && this.personalForm.invalid) {
      this.personalForm.markAllAsTouched();
      return;
    }
    if (this.currentStep === 2 && this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      return;
    }
    this.currentStep++;
  }

  /** Go back and reset reCAPTCHA if needed */
  prevStep(): void {
    if (this.currentStep > 1) this.currentStep--;
    if (this.currentStep < 3)
      this.acknowledgementForm.patchValue({ recaptchaToken: '' });
  }

  /** ----------------  FINAL SUBMISSION ---------------- */

  submitForm(): void {
    /** Guard validations */
    const ack = this.acknowledgementForm;
    if (!ack.get('declaration')?.value)
      return this.showError('Kindly acknowledge the agreement to proceed.');
    if (!ack.get('recaptchaToken')?.value)
      return this.showError('Please complete the reCAPTCHA verification.');

    /** Build payload */
    const payload = {
      ...this.personalForm.value,
      ...this.courseForm.value,
      ...ack.value,
      dob: this.formatDateToDMY(this.personalForm.value.dob),
      plannedStart: this.courseForm.value.plannedStart ? this.formatDateToDMY(this.courseForm.value.plannedStart) : '',
      plannedEnd: this.courseForm.value.plannedEnd ? this.formatDateToDMY(this.courseForm.value.plannedEnd) : ''
    };

    /** Remove irrelevant fields based on type */
    const removeKeys = payload.type === 'course'
      ? ['selectedProgram', 'selectedInternship']
      : ['selectedCourse', 'schedule', 'mode', 'plannedStart', 'plannedEnd'];

    removeKeys.forEach(key => delete payload[key]);

    /** API submission */
    this.contactService.sendMail(payload, 'enrollment')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => this.handleSuccess(res),
        error: err => this.handleError(err)
      });
  }

  /**  Show snackbar message */
  private showError(message: string) {
    this.snackBar.open(message, '', {
      duration: 3000, horizontalPosition: 'center',
      verticalPosition: 'top', panelClass: ['custom-snackbar-error']
    });
  }

  private handleSuccess(response: any) {
    this.resetAllForms();
    this.location.back();
    setTimeout(() =>
      this.snackBar.open('You have successfully enrolled.', '', {
        duration: 3000, horizontalPosition: 'center',
        verticalPosition: 'top', panelClass: ['custom-snackbar']
      }), 600);
  }

  private handleError(err: any) {
    this.location.back();
    setTimeout(() =>
      this.showError('Error sending form. Please try again later.'), 600);
    console.error(err);
  }

  /**  Reset state after submission */
  private resetAllForms() {
    this.personalForm.reset();
    this.courseForm.reset();
    this.acknowledgementForm.reset();
    this.currentStep = 1;
  }

  /**  ReCAPTCHA token update */
  onCaptchaResolved(token: string | null) {
    this.acknowledgementForm.patchValue({ recaptchaToken: token });
  }

  /**  File upload -> patch into form control */
  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    this.personalForm.patchValue({ resume: file });
    this.personalForm.get('resume')?.updateValueAndValidity();
  }
}
