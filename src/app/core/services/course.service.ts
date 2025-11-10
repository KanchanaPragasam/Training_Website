import { Injectable } from '@angular/core';
import { XmlReaderService } from './xml-reader.service';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
import { Course, CourseSection } from '../models/course-model';
import { HttpClient } from '@angular/common/http';
import { Internship, Program } from '../models/internship-model';





type CourseSource = 'all' | 'featured';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private paths = {
    all: '../../../assets/data/courses.xml',
    featured: '../../../assets/data/trending_courses.xml',
    internship: '../../../assets/data/internships.xml'
  };

  private coursesCache = new Map<CourseSource, Course[]>();
  private fullCoursesCache = new Map<string, Course>();

  private allSlugsSubject = new BehaviorSubject<string[]>([]);
  allSlugs$ = this.allSlugsSubject.asObservable();

  

  // Method to update all slugs
  setAllSlugs(slugs: string[]) {
    this.allSlugsSubject.next(slugs);
  }

  constructor(private xmlReader: XmlReaderService, private http : HttpClient) { }

   getInternshipData(xmlPath: string=this.paths.internship): Observable<Program[]> {
    return this.http.get(xmlPath, { responseType: 'text' }).pipe(
      map(xmlString => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
        const programNodes = Array.from(xmlDoc.getElementsByTagName('program'));

        const programs: Program[] = programNodes.map(programNode => {
          const nameNode = programNode.getElementsByTagName('name')[0];
          const internshipNodes = Array.from(programNode.getElementsByTagName('internship'));

          const internships: Internship[] = internshipNodes.map(internshipNode => ({
            title: internshipNode.getElementsByTagName('title')[0].textContent || ''
          }));

          return {
            name: nameNode.textContent || '',
            internships
          };
        });

        return programs;
      })
    );
  }
  
  getCourses(source: CourseSource = 'all'): Observable<Course[]> {
    
    if (this.coursesCache.has(source)) {
      const cached = this.coursesCache.get(source)!;
      console.log('slugs from cache', cached.map(c => c.courseName));
        console.log(this.allSlugs$);

      return of(cached);
    }

    return this.xmlReader.readXml(this.paths[source]).pipe(
      map(xml => {
        const courses = Array.from(xml?.getElementsByTagName('course') || []).map(node => this.parseCourse(node));
        this.coursesCache.set(source, courses);
          console.log(this.allSlugs$);
          console.log('slugs from xml', courses.map(c => c.courseName));
        this.setAllSlugs(courses.map(c => c.slug)); // update slugs here
        return courses;
      })
    );
  }

  getFullCourseById(slug: string, source: CourseSource = 'all'): Observable<Course | undefined> {
    const cacheKey = `${source}-${slug}`;
    if (this.fullCoursesCache.has(cacheKey)) {
      return of(this.fullCoursesCache.get(cacheKey));
    }

    return this.xmlReader.readXml(this.paths[source]).pipe(
      map(xml => {
        const courseNode = Array.from(xml?.getElementsByTagName('course') || [])
          .find(node => node.getAttribute('slug')?.trim() === slug);

        if (!courseNode) return undefined;

        const course = this.parseCourse(courseNode);
        this.fullCoursesCache.set(cacheKey, course);
        return course;
      })
    );
  }
getCourseNames(source: CourseSource = 'all'): Observable<string[]> {
  if (this.coursesCache.has(source)) {
    // Return courseNames from cached courses if available
    console.log('cached courseNames:', this.coursesCache.get(source)!.map(c => c.courseName));
    return of(this.coursesCache.get(source)!.map(c => c.courseName).filter(name => !!name));
  }

  return this.xmlReader.readXml(this.paths[source]).pipe(
    map(xml => {
      const courseNames = Array.from(xml?.getElementsByTagName('course') || []  )
        .map(node => node.getAttribute('courseName') ?? '')
        .filter(name => name.trim() !== '');
      console.log('courseNames from XML:', courseNames);
      return courseNames;
    })
  );
}



  // ✅ Shared method for parsing a <course> node
  private parseCourse(node: Element): Course {
    const parseList = (tagName: string) =>
      Array.from(node.getElementsByTagName(tagName)|| []).map(el => el.textContent?.trim() ?? '');

    const getText = (tagName: string) =>
      node.getElementsByTagName(tagName)[0]?.textContent?.trim() ?? '';

    const course: Course = {
      id: +node.getAttribute('id')!,
      slug: node.getAttribute('slug')!,
          courseName: node.getAttribute('courseName') ?? '', 
      image: getText('image'),
      video: getText('video'),
      courseCategory: getText('courseCategory'),
      courseTitle: getText('courseTitle'),
      courseDescription: parseList('desc'),
      courseDuration: getText('courseDuration'),
      courseStudents: +getText('courseStudents'),
      overview: getText('overview'),
      courseHighlights: parseList('highlight') || undefined,
      careerScope: parseList('scope') || undefined,
      canEnroll: parseList('enroll') || undefined,
      toolsCovered: (() => {
        const toolsNode = node.getElementsByTagName('toolsCovered')[0];
        return toolsNode
          ? Array.from(toolsNode.getElementsByTagName('tool')|| []).map(t => t.textContent?.trim() ?? '')
          : undefined;
      })(),
      faq: (() => {
        const faqNode = node.getElementsByTagName('faq')[0];
        if (!faqNode) return undefined;
        const questions = Array.from(faqNode.getElementsByTagName('question')|| []).map(qNode => ({
          id: +qNode.getAttribute('id')!,
          question: qNode.getElementsByTagName('q')[0]?.textContent?.trim() ?? '',
          answer: qNode.getElementsByTagName('a')[0]?.textContent?.trim() ?? ''
        }));
        return questions.length ? questions : undefined;
      })()
    };

    // ✅ Parse syllabus if exists
    const syllabusNode = node.getElementsByTagName('syllabus')[0];
    if (syllabusNode) {
      const sections = Array.from(syllabusNode.getElementsByTagName('section')|| []).map(sectionNode => ({
        id: +sectionNode.getAttribute('id')!,
        title: sectionNode.getAttribute('title') ?? '',
        durationMinutes: +sectionNode.getAttribute('durationMinutes')! || 0,
        lessons: Array.from(sectionNode.getElementsByTagName('lesson')).map(lesson =>
          lesson.textContent?.trim() ?? ''
        )
      }));

      course.syllabus = {
        sections: +getTextFromNode(syllabusNode, 'sections'),
        lessons: +getTextFromNode(syllabusNode, 'lessons'),
        duration: +getTextFromNode(syllabusNode, 'duration') || 0,
        sectionsList: sections
      };
    }

    return course;
  }
}

// 🔧 Helper (can be moved to a utility if reused elsewhere)
function getTextFromNode(node: Element, tagName: string): string {
  return node.getElementsByTagName(tagName)[0]?.textContent?.trim() ?? '';
}
