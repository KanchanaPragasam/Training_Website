import { Component, Input } from '@angular/core';
import { Course } from '../../core/models/course-model';
import { Router } from '@angular/router';


@Component({
  selector: 'app-card',
  standalone: false,
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})

export class CardComponent {

  @Input() course !: Course;
  constructor(private router: Router) {  
  }
  
  goToCourseDetails(course: Course) {
    this.router.navigate(['/courses', course.slug], { state: { selectedCourse: course} });
  }
}