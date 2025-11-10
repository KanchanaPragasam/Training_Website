import { Component, ElementRef, HostListener, Inject, OnInit, PLATFORM_ID, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Course, CourseSection } from '../../../core/models/course-model';
import { CourseService } from '../../../core/services/course.service';
import { ContactService } from '../../../core/services/contact.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, NgForm } from '@angular/forms';
import { faq } from '../../../core/models/faq-model';
import { XmlReaderService } from '../../../core/services/xml-reader.service';
import { isPlatformBrowser } from '@angular/common';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-course-details',
  standalone: false,
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.scss']
})
export class CourseDetailsComponent implements OnInit {
  @ViewChild('bannerVideo') bannerVideo!: ElementRef<HTMLVideoElement>;
  faqList: faq[] = [];
  course?: Course;
  sections: CourseSection[] = [];
  activeTab: string = 'overview';

  message: string = '';
  videoLoaded = false;
  // rich text box options
  quillModules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }]
    ]
  };
  contactForm!: FormGroup;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private coursesService: CourseService,
    private contactService: ContactService,
    private snackBar: MatSnackBar,
    private xmlReader: XmlReaderService,
    private seo: SeoService,
    @Inject(PLATFORM_ID) private platformId: Object
    // private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
  if (isPlatformBrowser(this.platformId)) {
    this.course = history.state?.selectedCourse || null;
  }

  const slug = this.route.snapshot.paramMap.get('slug');
  const baseUrl = 'https://wp4.inspirationcs.ca/courses/';

  // --- SEO update function ---
 const updateSEO = (course: any) => {
    const pageUrl = `${baseUrl}/${slug}`;

    // 🔹 Extract key details safely
    const courseName = course.courseName || 'Software Training Service ';
    const shortDesc = Array.isArray(course.courseDescription)
      ? course.courseDescription.slice(0, 2).join(' ')
      : course.courseDescription?.toString().substring(0, 180) || 'Join our professional IT training program in Ambattur.';

    // 🔹 Build SEO meta dynamically (unique per course)
    const seoTitle = `${courseName} Training in Ambattur | Learn ${courseName} with Certification`;
    const seoDescription = `${shortDesc} Master ${courseName} with hands-on classes, projects, and certification at Software Training Service, Ambattur.`;

    // 🔹 Use absolute image URLs
    const ogImage = course.image?.startsWith('http')
      ? course.image
      : `https://wp4.inspirationcs.ca${course.image || '/assets/images/logo-croped.webp'}`;

    // --- SEO Update Call ---
    this.seo.updateMetaData({
      title: seoTitle,
      description: seoDescription,
      image: ogImage,
      url: pageUrl,
      canonical: pageUrl,
      robots: 'index, follow',
      schema: {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": courseName,
        "description": seoDescription,
        "provider": {
          "@type": "EducationalOrganization",
          "name": "Software Training Service",
          "url": "https://wp4.inspirationcs.ca",
          "logo": {
            "@type": "ImageObject",
            "url": "https://wp4.inspirationcs.ca/assets/images/logo-croped.webp"
          },
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Ambattur",
            "addressRegion": "Tamil Nadu",
            "addressCountry": "IN"
          }
        },
        "hasCourseInstance": {
          "@type": "CourseInstance",
          "courseMode": "Offline/Online",
          "location": {
            "@type": "Place",
            "name": "Software Training Service - Ambattur",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Ambattur",
              "addressRegion": "Tamil Nadu",
              "addressCountry": "IN"
            }
          }
        }
      }
    });
  };
  if (this.course) {
    // Update SEO if course data is already available
    updateSEO(this.course);
  } else if (slug) {
    // Fetch course if not in history state
    this.coursesService.getFullCourseById(slug).subscribe(course => {
      this.course = course;
      updateSEO(course);
    });
  }

  this.sections = this.course?.syllabus?.sectionsList ?? [];
}






  enrollNow() {
    if (this.course) {

      console.log('form page routed', this.course.courseName);
      this.router.navigate(['/enrollment'], { state: { selectedCourse: this.course?.courseName || '' } });
    } else {
      console.error('No course selected to enroll!');
    }
  }
  // video to be play after refresh also
  ngAfterViewChecked() {
    if (isPlatformBrowser(this.platformId)) {
      this.playBannerVideo();
    }
  }



  private playBannerVideo(): void {
    if (!isPlatformBrowser(this.platformId)) return; // 🔒 extra safety guard

    const video = document.getElementById('bannerVideo') as HTMLVideoElement | null;
    if (video && typeof video.play === 'function') {
      video.play().catch(err => console.warn('Autoplay blocked or failed:', err));
    }
  }



  onVideoLoaded() {
    this.videoLoaded = true;
  }

  scrollTo(sectionId: string) {
    this.activeTab = sectionId;
    if (isPlatformBrowser(this.platformId)) {

      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Detect scroll position and update active tab
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const sections = ['overview', 'syllabus', 'career'];
    for (let sec of sections) {
      if (isPlatformBrowser(this.platformId)) {
        const el = document.getElementById(sec);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            this.activeTab = sec;
            break;
          }
        }
      }
    }
  }
  allExpanded: boolean = false;

  toggleFaqItem(index: number): void {
    if (!this.course?.faq || !this.course.faq[index]) return;
    this.course.faq[index].isOpen = !this.course.faq[index].isOpen;
    this.checkAllExpanded();
  }

  // 🔹 Toggles all FAQs open/closed
  toggleAllFAQs(): void {
    if (!this.course?.faq) return;
    this.allExpanded = !this.allExpanded;
    this.course.faq.forEach((item: any) => (item.isOpen = this.allExpanded));
  }

  // 🔹 Checks if all FAQs are currently expanded
  private checkAllExpanded(): void {
    if (!this.course?.faq) return;
    this.allExpanded = this.course.faq.every((item: any) => item.isOpen);
  }


}