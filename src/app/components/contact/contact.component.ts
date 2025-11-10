import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, NgForm, ValidationErrors, Validators } from '@angular/forms';
import { ContactService } from '../../core/services/contact.service';

import { MatSnackBar } from '@angular/material/snack-bar';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-contact',
  standalone: false,
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
  message: string = '';
  contactForm!: FormGroup;
  // rich text box tools options
  quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }]
    ]
  };


  constructor(private contactService: ContactService, private snackBar: MatSnackBar, private fb: FormBuilder, private seo: SeoService) { }
  ngOnInit(): void {
    // --- Existing form setup ---
    this.contactForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z\\s]{2,30}$') // Only letters & spaces
      ]],
      mobile: ['', [
        Validators.required,
        Validators.pattern('^[0-9]{10}$') // 10-digit numbers
      ]],
      email: ['', [
        Validators.required,
        Validators.email
      ]],
      message: ['', [Validators.required, this.quillContentValidator]]
    });

    // --- SEO Setup ---

  const pageUrl = 'https://wp4.inspirationcs.ca/contact';

  this.seo.updateMetaData({
    title: 'Contact Software Training Service Ambattur | IT Courses & Internship Enquiry',
    description:
      'Reach out to Software Training Service, Ambattur for IT course details, internship enrollments, or support. Call +91-XXXXXXXXXX or visit our Ambattur training center.',
    image: 'https://wp4.inspirationcs.ca/assets/images/logo-croped.webp',
    url: pageUrl,
    canonical: pageUrl,
    robots: 'index, follow',
    schema: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      "url": pageUrl,
      "name": "Contact - Software Training Service Ambattur",
      "description": "Get in touch with Software Training Service for IT training and internship queries in Ambattur.",
      "mainEntity": {
        "@type": "Organization",
        "name": "Software Training Service",
        "url": "https://wp4.inspirationcs.ca/contact",
        "logo": "https://wp4.inspirationcs.ca/assets/images/logo-croped.webp",
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+91-XXXXXXXXXX",
          "contactType": "Customer Support",
          "areaServed": "IN",
          "availableLanguage": ["English", "Tamil"]
        },
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "No. 123, XYZ Street, Ambattur",
          "addressLocality": "Ambattur",
          "addressRegion": "Tamil Nadu",
          "postalCode": "600053",
          "addressCountry": "IN"
        }
      }
    }
  });
  }



  quillContentValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    const plainText = value.replace(/<[^>]+>/g, '').replace(/\n/g, '').trim(); // strip all tags + line breaks
    return plainText.length === 0 ? { required: true } : null;
  }


  sendEnquiry() {



    // update the message control for validation
    this.contactForm.get('message')?.setValue(this.message);


    if (this.contactForm.invalid) {
      this.snackBar.open('Please fill all required fields correctly.', undefined, {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['custom-snackbar-error']
      });
      return;
    }

    const contactData = this.contactForm.value;
    console.log('Contact Data:', contactData);

    this.contactService.sendMail(contactData, 'contact').subscribe({
      next: (res) => {
        this.snackBar.open('Contact sent successfully!', undefined, {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['custom-snackbar']
        });
        this.contactForm.reset();


      },
      error: (err) => {
        console.error(err);
        this.snackBar.open('Failed to send contact. Try again.', undefined, {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['custom-snackbar-error']
        });
      }
    });
  }



}
