import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-about',
  standalone: false,
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {

  constructor(private seo: SeoService) { }
  steps = [
    { title: 'Theory', icon: 'bi bi-book' },
    { title: 'Practicals', icon: 'bi bi-pencil-square' },
    { title: 'Assignment', icon: 'bi bi-journal-check' },
    { title: 'Certification', icon: 'bi bi-award' }
  ];


  // What we offer cards
  offers = [
    {
      title: 'Hands-On Classroom Training',
      description: 'Experience face-to-face learning with real-time interaction, hands-on labs, and whiteboard sessions.',
      icon: 'bi bi-easel'
    },
    {
      title: 'Certified Expert Trainers',
      description: 'Our trainers are industry-certified professionals with deep practical knowledge and teaching expertise.',
      icon: 'bi bi-person-workspace'
    },
    {
      title: 'Structured Schedule',
      description: 'Attend regularly scheduled sessions with a guided path and dedicated support throughout your learning.',
      icon: 'bi bi-calendar-check'
    },
    {
      title: 'Peer Interaction & Networking',
      description: 'Collaborate with fellow learners, ask questions in real time, and grow your professional network.',
      icon: 'bi bi-people'
    }
  ];

  ngOnInit(): void {
    const pageUrl = 'https://wp4.inspirationcs.ca/about';

  this.seo.updateMetaData({
    title: 'About Software Training Service | Best IT Training Institute in Ambattur',
    description:
      'Software Training Service in Ambattur offers expert-led courses in Java, Python, Angular, React & Web Development. Learn from certified trainers with hands-on projects.',
    image: 'https://wp4.inspirationcs.ca/assets/images/og-about.jpg',
    url: pageUrl,
    canonical: pageUrl,
    robots: 'index, follow',
    schema: {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "url": pageUrl,
      "name": "About MissionMind | Best IT Training Institute in Ambattur",
      "description":
        "Learn more about Software Training Service in Ambattur — our mission, vision, expert trainers, and hands-on learning approach for job-ready skills.",
      "mainEntity": {
        "@type": "Organization",
        "name": "Software Training Service",
        "url": "https://wp4.inspirationcs.ca/about",
        "logo": "https://wp4.inspirationcs.ca/assets/images/logo-croped.webp",
        "sameAs": [
          "https://www.facebook.com/missionmindtech",
          "https://www.linkedin.com/company/missionmindtech",
          "https://www.instagram.com/missionmindtech"
        ],
        "description": "Leading IT training institute in Ambattur specializing in Java, Python, Web Development, and professional upskilling.",
        "foundingDate": "2020",
       
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "No. 12, XYZ Street, Ambattur",
          "addressLocality": "Chennai",
          "addressRegion": "Tamil Nadu",
          "postalCode": "600053",
          "addressCountry": "IN"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+91-XXXXXXXXXX",
          "contactType": "Customer Support",
          "areaServed": "IN",
          "availableLanguage": ["English", "Tamil"]
        }
      }
    }
  });
  }



}
