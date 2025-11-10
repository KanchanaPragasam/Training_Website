import { Component, OnInit } from '@angular/core';
import { CourseService } from '../../../core/services/course.service';
import { Course } from '../../../core/models/course-model';
import { SeoService } from '../../../core/services/seo.service';
import { log } from 'console';

@Component({
  selector: 'app-course-list',
  standalone: false,
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.scss']
})
export class CourseListComponent implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];

  searchTerm: string = '';
  selectedCategory: string = '';
  categories: string[] = [];
  categoriesWithAll: string[] = [];
  loading: boolean = true;

  constructor(private coursesService: CourseService, private seo: SeoService) { }

  ngOnInit(): void {
    this.loading = true; // start loader
    this.coursesService.getCourses('all').subscribe({
      next: (courses) => {
        this.courses = courses;


        this.filteredCourses = courses;

        this.categories = Array.from(new Set(courses.map(c => c.courseCategory)));
        this.categoriesWithAll = ['All', ...this.categories];

        this.selectedCategory = 'All';
        this.loading = false;

        console.log("courses list",this.courses);
        const pageUrl = 'https://wp4.inspirationcs.ca/courses';

        this.seo.updateMetaData({
          title: 'IT Courses in Ambattur | Java, Python, Angular & Web Dev | Software Training Service',
          description:
            'Explore top IT training courses in Ambattur. Learn Java, Python, Angular, C++, and web development with expert trainers. Certifications included.',
          image: '/assets/images/logo-croped.webp',
          url: "/assets/images/logo-croped.webp",
          canonical: "https://wp4.inspirationcs.ca/courses",
          robots: 'index, follow',
          schema: {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "All IT Courses - Your Academy Ambattur",
            "itemListOrder": "Ascending",
            "itemListElement": courses.map((course, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "url": `https://wp4.inspirationcs.ca/courses`,
              "name": course.courseTitle
            })),
            "publisher": {
              "@type": "Organization",
              "name": "Software Training Service",
              "url": "https://wp4.inspirationcs.ca/",
              "logo": {
                "@type": "ImageObject",
                "url": "https://wp4.inspirationcs.ca/assets/images/logo-croped.webp"
              }
            }
          }
        });

      },
      error: () => {
        this.loading = false;
      }
    });
  }



  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    const category = this.selectedCategory;

    this.filteredCourses = this.courses.filter(course => {
      const matchesSearch =
        course.courseCategory.toLowerCase().includes(term) ||
        course.courseTitle.toLowerCase().includes(term) ||
        course.courseDuration.toLowerCase().includes(term) ||
        course.courseDescription.some(desc => desc.toLowerCase().includes(term)) ||
        (course.courseHighlights?.some(h => h.toLowerCase().includes(term)) ?? false) ||
        (course.overview?.toLowerCase().includes(term) ?? false) ||
        (course.careerScope?.some(scope => scope.toLowerCase().includes(term)) ?? false) ||
        (JSON.stringify(course.syllabus ?? {}).toLowerCase().includes(term));

      // If "All" is selected, show all
      const matchesCategory = category === 'All' ? true : course.courseCategory === category;

      return matchesSearch && matchesCategory;
    });
  }
}
