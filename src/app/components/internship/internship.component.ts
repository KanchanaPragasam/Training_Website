import { Component, OnInit } from '@angular/core';
import { XmlReaderService } from '../../core/services/xml-reader.service';
import { faq } from '../../core/models/faq-model';
import { HttpClient } from '@angular/common/http';
import { SeoService } from '../../core/services/seo.service';


interface Internship {
  title: string;
  category: string;
  description: string;
  duration: string;
  startDate: string;
  keySkills: KeySkills;
  projectOutput?: string[];
}

interface KeySkills {
  programmingLanguages?: string[];
  scripting?: string[];
  frontend?: string[];
  backend?: string[];
  databases?: string[];
  testingTools?: string[];
}

interface Program {
  name: string;
  level: string;
  internships: Internship[];
}


@Component({
  selector: 'app-internship',
  standalone: false,
  templateUrl: './internship.component.html',
  styleUrls: ['./internship.component.scss']
})
export class InternshipComponent implements OnInit {
  categories: string[] = [];
  internships: Internship[] = [];
  filteredInternships: Internship[] = [];
  selectedCategory = 'All';
  programs: Program[] = [];
  activeTab: number = 0; // default tab



  constructor(private http: HttpClient, private seo: SeoService) { }

  ngOnInit() {
    const pageUrl = 'https://wp4.inspirationcs.ca/internship';

    this.seo.updateMetaData({
      title: 'IT Internships in Ambattur | Software & Web Development Internships',
      description:
        'Apply for top IT internships in Ambattur at Software Training Service. Gain hands-on experience in Java, Python, Web Development & UI/UX Design. Build your career with us.',
      image: 'https://wp4.inspirationcs.ca/assets/images/course-bg.webp',
      url: pageUrl,
      canonical: pageUrl,
      robots: 'index, follow',
      schema: {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Available IT Internships | Software Training Service",
        "description": "Explore current internship opportunities in Java, Python, Web Development, and Design at Software Training Service, Ambattur.",
        "url": pageUrl,
        "itemListOrder": "Ascending",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "url": "https://wp4.inspirationcs.ca/internship",
            "name": "Internship"
          },

        ],
        "publisher": {
          "@type": "Organization",
          "name": "Software Training Service",
          "url": "https://wp4.inspirationcs.ca/internship",
          "logo": "https://wp4.inspirationcs.ca/assets/images/logo-croped.webp",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "No. 12, XYZ Street, Ambattur",
            "addressLocality": "Chennai",
            "addressRegion": "Tamil Nadu",
            "postalCode": "600053",
            "addressCountry": "IN"
          }
        }
      }
    });

    // Your existing logic
    this.fetchInternships();
  }



  fetchInternships() {
    this.http.get('assets/data/internships.xml', { responseType: 'text' })
      .subscribe(data => this.parseXML(data));
  }

  parseXML(xmlString: string) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlString, 'application/xml');

    this.programs = Array.from(xml.querySelectorAll('program')).map(p => {
      const name = p.querySelector('name')?.textContent || '';
      const level = p.querySelector('level')?.textContent || '';

      const internships = Array.from(p.querySelectorAll('internship')).map(i => {
        const keySkillsNode = i.querySelector('keySkills');
        const keySkills: KeySkills = {
          programmingLanguages: Array.from(keySkillsNode?.querySelectorAll('programmingLanguages > language') || []).map(n => n.textContent || ''),
          scripting: Array.from(keySkillsNode?.querySelectorAll('scripting > script') || []).map(n => n.textContent || ''),
          frontend: Array.from(keySkillsNode?.querySelectorAll('frontend > tech') || []).map(n => n.textContent || ''),
          backend: Array.from(keySkillsNode?.querySelectorAll('backend > tech') || []).map(n => n.textContent || ''),
          databases: Array.from(keySkillsNode?.querySelectorAll('databases > database') || []).map(n => n.textContent || ''),
          testingTools: Array.from(keySkillsNode?.querySelectorAll('testingTools > tool') || []).map(n => n.textContent || '')
        };

        const projectOutput = Array.from(i.querySelectorAll('projectOutput > output')).map(o => o.textContent || '');

        return {
          title: i.querySelector('title')?.textContent || '',
          category: i.querySelector('category')?.textContent || '',
          description: i.querySelector('description')?.textContent || '',
          duration: i.querySelector('duration')?.textContent || '',
          startDate: i.querySelector('startDate')?.textContent || '',
          keySkills,
          projectOutput: projectOutput.length ? projectOutput : undefined
        };
      });

      return { name, level, internships };
    });

    // Optional: flatten internships for filtering
    this.internships = this.programs.flatMap(p => p.internships);
  }


  selectCategory(cat: string) {
    this.selectedCategory = cat;
    this.filteredInternships =
      cat === 'All' ? this.internships : this.internships.filter(i => i.category.toLowerCase() === cat.toLowerCase());
  }
  enrollNow() {

  }
  // applyNow(item: Internship) {
  //   alert(`Applying for "${item.title}" under ${item.category}`);
  // }
}