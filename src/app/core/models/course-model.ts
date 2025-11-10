import { faq } from "./faq-model";

export interface Course {
  id: number;
  slug: string;
    courseName:string;
  image: string;
  video:string;
  courseCategory: string;
  courseTitle: string;
  courseDescription: string[];
  courseDuration: string;
  courseStudents: number;
  overview?: string;
  courseHighlights?: string[];
  careerScope?: string[];
  syllabus?: Syllabus;
  canEnroll?:string[];
  toolsCovered?:string[];
  faq?: faq[];

}

export interface Syllabus {
  sections: number;
  lessons: number;
  duration: number; 
  sectionsList: CourseSection[];
}

export interface CourseSection {
  id: number;
  title: string;
  durationMinutes: number;
  lessons: string[];
}