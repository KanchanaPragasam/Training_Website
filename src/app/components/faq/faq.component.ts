import { isPlatformBrowser } from '@angular/common';
import { XmlReaderService } from '../../core/services/xml-reader.service';
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewInit,
  HostListener,
  Renderer2,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { SeoService } from '../../core/services/seo.service';
import { HttpClient } from '@angular/common/http';

interface Faq {
  id: string;
  category: string;
  question: string;
  answer: string;
  isOpen?: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: false,
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
})
export class FaqComponent implements OnInit, AfterViewInit {
  @ViewChild('sliderRef') sliderRef!: ElementRef<HTMLDivElement>;

  // Thumb position and width in percentage relative to track width
  thumbLeft = 0;
  thumbWidth = 0;

  private dragging = false;
  private dragStartX = 0;
  private thumbStartLeft = 0;

  faqList: Faq[] = [];
  groupedFaqs: { [category: string]: Faq[] } = {};
  categories: string[] = [];

  selectedCategory: string = '';
  selectedFaqId: string | null = null;

  constructor(
    private xmlReader: XmlReaderService,
    private renderer: Renderer2, @Inject(PLATFORM_ID) private platformId: Object,
    private seo: SeoService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadFaqs();
    this.seo.updateMetaData({
      title: 'FAQs - IT Courses & Internships | Software Training Service Ambattur',
      description:
        'Find answers to common questions about our IT training courses, enrollments, and internships at Your Academy, Ambattur. Learn Java, Python, Angular, and more.',
      image: '/assets/images/logo-croped.webp',
      url: 'https://wp4.inspirationcs.ca/assets/images/logo-croped.webp',
      robots: 'index, follow',
      canonical: 'https://wp4.inspirationcs.ca/assets/images/logo-croped.webp',
      schema: {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How can I enroll in a course?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can enroll online through our enrollment form or visit our Ambattur center directly."
            }
          },
          {
            "@type": "Question",
            "name": "Do you offer internship opportunities?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, we provide internship programs in web development, Python, and Java for eligible students."
            }
          },
          {
            "@type": "Question",
            "name": "Are certifications provided after course completion?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, all our training programs include completion certificates recognized by industry partners."
            }
          }
        ]
      }
    });
  }

  loadFaqs(): void {
    this.http.get<Faq[]>('assets/data/faq.json').subscribe((faqs) => {
      // Assign FAQ list
      this.faqList = faqs;

      // Group FAQs by category
      this.groupedFaqs = this.faqList.reduce((groups, faq) => {
        if (!groups[faq.category]) {
          groups[faq.category] = [];
        }
        groups[faq.category].push(faq);
        return groups;
      }, {} as { [category: string]: Faq[] });

      // Set categories and default selection
      this.categories = Object.keys(this.groupedFaqs);
      this.selectedCategory = this.categories.includes('Enrollment')
        ? 'Enrollment'
        : this.categories[0];

      // Select first FAQ of selected category by default
      this.selectedFaqId =
        this.groupedFaqs[this.selectedCategory]?.[0]?.id || null;
    });
  }
  selectCategory(category: string): void {
    if (this.selectedCategory !== category) {
      this.selectedCategory = category;
      this.selectedFaqId = this.groupedFaqs[category]?.[0]?.id || null;

      // Scroll to category and update scrollbar
      this.scrollToCategory(category);
    }
  }

  removeSpaces(str: string): string {
    return str.replace(/\s+/g, '');
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.updateThumb();
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (isPlatformBrowser(this.platformId)) {
      this.updateThumb();
    }
  }

  onCategoryScroll() {
    if (!this.dragging) this.updateThumb();
  }

  updateThumb() {
    if (!this.sliderRef?.nativeElement) return;
    const el = this.sliderRef.nativeElement;

    // Thumb fixed width is always 10%
    this.thumbWidth = 30;

    // Handle no scroll scenario gracefully
    if (el.scrollWidth <= el.clientWidth) {
      this.thumbLeft = 0;
      return;
    }

    const scrollRatio = el.scrollLeft / (el.scrollWidth - el.clientWidth);

    // Move thumb within available space (100% - thumbWidth)
    this.thumbLeft = scrollRatio * (100 - this.thumbWidth);
  }

  scrollToCategory(category: string) {
    if (!this.sliderRef) return;

    const sliderEl = this.sliderRef.nativeElement;
    const categoryEls = sliderEl.querySelectorAll('.faq-category');

    const index = this.categories.indexOf(category);
    if (index === -1) return;

    const categoryEl = categoryEls[index] as HTMLElement;

    if (categoryEl) {
      // Scroll smoothly to the selected category
      categoryEl.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });

      // Wait for scroll to finish then update thumb
      setTimeout(() => {
        this.updateThumb();
      }, 300);
    }
  }

  // Drag logic for thumb

  startDrag(event: MouseEvent | TouchEvent) {
    event.preventDefault();
    this.dragging = true;

    if (event instanceof MouseEvent) {
      this.dragStartX = event.clientX;
    } else if (event.touches && event.touches.length) {
      this.dragStartX = event.touches[0].clientX;
    }

    this.thumbStartLeft = this.thumbLeft;

    this.renderer.listen('window', 'mousemove', this.onDrag);
    this.renderer.listen('window', 'touchmove', this.onDrag);
    this.renderer.listen('window', 'mouseup', this.stopDrag);
    this.renderer.listen('window', 'touchend', this.stopDrag);
  }

  onDrag = (event: MouseEvent | TouchEvent) => {
    if (!this.dragging || !this.sliderRef) return;

    let clientX = 0;
    if (event instanceof MouseEvent) {
      clientX = event.clientX;
    } else if (event.touches && event.touches.length) {
      clientX = event.touches[0].clientX;
    }

    const deltaX = clientX - this.dragStartX;

    const trackEl = (
      this.sliderRef.nativeElement.parentElement as HTMLElement
    ).querySelector('.faq-scrollbar-track') as HTMLElement;

    if (!trackEl) return;

    const trackWidth = trackEl.clientWidth;
    const maxLeft = 100 - this.thumbWidth;

    // Calculate new left in percentage
    let newLeft = this.thumbStartLeft + (deltaX / trackWidth) * 100;

    newLeft = Math.min(Math.max(newLeft, 0), maxLeft);

    this.thumbLeft = newLeft;

    // Scroll categories accordingly
    const el = this.sliderRef.nativeElement;
    const scrollMax = el.scrollWidth - el.clientWidth;
    el.scrollLeft = (newLeft / maxLeft) * scrollMax;
  };

  stopDrag = () => {
    this.dragging = false;
  };

  // Tracks whether all FAQs in the current category are open
  allExpanded: boolean = false;

  toggleItem(index: number): void {
    const currentFaqs = this.groupedFaqs[this.selectedCategory];
    if (!currentFaqs) return;

    currentFaqs[index].isOpen = !currentFaqs[index].isOpen;
    this.checkAllExpanded();
  }

  // 🔹 Toggle all FAQs for the selected category
  toggleAllFAQs(): void {
    const currentFaqs = this.groupedFaqs[this.selectedCategory];
    if (!currentFaqs) return;

    this.allExpanded = !this.allExpanded;
    currentFaqs.forEach((item) => (item.isOpen = this.allExpanded));
  }

  // 🔹 Check if all FAQs in current category are expanded
  private checkAllExpanded(): void {
    const currentFaqs = this.groupedFaqs[this.selectedCategory];
    if (!currentFaqs) return;

    this.allExpanded = currentFaqs.every((item) => item.isOpen);
  }

}
