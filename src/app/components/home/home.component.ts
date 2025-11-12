import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { Carousel } from 'bootstrap';
import { XmlReaderService } from '../../core/services/xml-reader.service';
import { CourseService } from '../../core/services/course.service';
import { Course } from '../../core/models/course-model';
import { faq } from '../../core/models/faq-model';
import { isPlatformBrowser } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {

  faqList: faq[] = [];
  courses: Course[] = [];
  groupedCourses: Course[][] = [];
  activeSlideIndex = 0;
  test: boolean = true;

  private carouselInstance!: Carousel;
  carouselReady = false;


  constructor(
    private xmlReader: XmlReaderService,
    private coursesService: CourseService,
    private cdr: ChangeDetectorRef, @Inject(PLATFORM_ID) private platformId: Object,
    private seo: SeoService,
    private http:HttpClient
  ) { }

  ngOnInit(): void {
    const seoData = {
    title: 'Top IT Training Institute in Ambattur | Software Training Service',
    description: 'Join Ambattur’s leading IT training center. Master Java, Python, Angular, React & more with expert trainers. Certifications & career support included.',
    image: '/assets/images/logo-croped.webp',
    url: 'https://wp4.inspirationcs.ca/home',
    schema: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Your Academy",
      "url": "https://wp4.inspirationcs.ca/home",
      "logo": "https://wp4.inspirationcs.ca/assets/images/logo-croped.webp"
    },
    
  };

  this.seo.updateMetaData(seoData);
    this.coursesService.getCourses('all').subscribe((courses) => {
      this.courses = courses;
      this.groupCoursesByScreenSize();
      this.carouselReady = true;

      // We use setTimeout to ensure Bootstrap runs AFTER Angular has fully rendered the *ngIf block
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          this.initializeCarousel();

        }, 0);
      }
    });

    this.loadFaqs();
  
  }
   loadFaqs(): void {
    this.http.get<faq[]>('assets/data/homefaq.json').subscribe((faqs) => {
      // Assign FAQ list and initialize isOpen
      this.faqList = faqs.map(faq => ({ ...faq, isOpen: false }));
    });
  }
  @HostListener('window:resize')
  onResize() {
    // We update the grouping immediately on resize
    if (isPlatformBrowser(this.platformId)) {
      this.disposeCarousel(); // Clean up the old one first
      this.groupCoursesByScreenSize(); // This updates the DOM structure

      // Wait for Angular to update the DOM with new group size before initializing
      this.cdr.detectChanges();
      setTimeout(() => {
        this.initializeCarousel();
      }, 0);
    }
  }

  groupCoursesByScreenSize(): void {
    if (isPlatformBrowser(this.platformId)) {
      const width = window.innerWidth;
      const groupSize = width < 768 ? 1 : 3;
      this.groupedCourses = this.chunkArray(this.courses, groupSize);
      this.activeSlideIndex = 0;
      // Note: cdr.detectChanges() removed from here, moved to onResize/ngOnInit wrapping setTimeout
    }
  }

  chunkArray<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  }

  //   async ngAfterViewInit(): Promise<void> {

  //     const { Carousel } = await import('bootstrap'); // dynamically import only in browser

  //     const carouselEl = document.getElementById('courseCarousel');
  //     if (carouselEl) {
  //       this.carouselInstance = new Carousel(carouselEl, {
  //         interval: 2000,
  //         ride: 'carousel',
  //         wrap: true,
  //         pause: false,
  //       });

  //       carouselEl.addEventListener('slid.bs.carousel', (event: any) => {
  //         this.activeSlideIndex = event.to;
  //         // this.cdr.detectChanges();
  //       });
  //     }

  // }


  private async initializeCarousel(): Promise<void> {
    if (!isPlatformBrowser(this.platformId) || this.carouselInstance) return;

    const { Carousel } = await import('bootstrap');
    const carouselEl = document.getElementById('courseCarousel');

    if (carouselEl) {
      this.carouselInstance = new Carousel(carouselEl, {
        // Options from your HTML data attributes are picked up automatically by Bootstrap JS, 
        // but explicit JS options can override them if provided here.
        interval: 4000, // Matches your HTML data-bs-interval
        ride: 'carousel',
        wrap: true,
        // pause: false, // If you want pause on hover disabled
      });

      // Attach listener using a bound function for easy removal
      carouselEl.addEventListener('slid.bs.carousel', this.carouselSlideListener);
    }
  }

  private disposeCarousel(): void {
    if (this.carouselInstance) {
      const carouselEl = document.getElementById('courseCarousel');
      if (carouselEl) {
        carouselEl.removeEventListener('slid.bs.carousel', this.carouselSlideListener);
      }
      this.carouselInstance.dispose();
      // Explicitly set to null/undefined after disposal to allow reinitialization check
      this.carouselInstance = undefined!;
    }
  }

  private carouselSlideListener = (event: any) => {
    this.activeSlideIndex = event.to;
    this.cdr.detectChanges(); // Update Angular view model
  }

  ngOnDestroy(): void {
    this.disposeCarousel();
  }



  cardList = [
    {
      title: '1:1 Mentorships',
      description: 'Our experienced instructors will provide guidance and support as you learn, and our courses are designed to give you the flexibility to learn at your own pace. Sign up for one of our courses today and start learning!',
      image: '../../../../assets/images/learning-1.png',
      overlayImage: '../../../../assets/images/banner1-bg-removed.webp',
      bgColor: '#f1f1f1',

    },
    {
      title: 'Coding Bootcamps',
      description: 'Our courses are designed to help you learn the fundamentals of coding and other related topics. Whether you’re a beginner or an experienced professional, our courses provide detailed and up-to-date information that will help you gain a comprehensive understanding of the topics.',
      image: '../../../../assets/images/learning-2.png',
      overlayImage: '../../../../assets/images/banner1-bg-removed.webp',
      bgColor: '#fffff',
    }
  ];

  steps = [
    {
      title: 'Learn to Code',
      description: 'Master in-demand programming skills with real-world projects and interactive lessons.'
    },
    {
      title: 'Get Certified',
      description: 'Earn certifications to showcase your expertise and stand out.'
    },
    {
      title: 'Get Hired',
      description: 'Turn your skills into a career with guidance, resume support, and job-ready preparation.'
    }
  ]
  toggleItem(index: number): void {
    this.faqList[index].isOpen = !this.faqList[index].isOpen;
    this.checkAllExpanded();
  }

  allExpanded: boolean = false;

  toggleAllFAQs(): void {
    this.allExpanded = !this.allExpanded;
    this.faqList.forEach(item => item.isOpen = this.allExpanded);
  }

  private checkAllExpanded(): void {
    this.allExpanded = this.faqList.every(item => item.isOpen);
  }


}

