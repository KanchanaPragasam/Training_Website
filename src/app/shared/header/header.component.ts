import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  isNavOpen = false;
   constructor(private router: Router,@Inject(PLATFORM_ID) private platformId: Object) {
    
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isNavOpen = false;
        if (isPlatformBrowser(this.platformId)) {
          window.scrollTo(0, 0);
        }
      }
    });
  }

  toggleNav() {
    this.isNavOpen = !this.isNavOpen;
  }

  openWhatsApp(){
    if (isPlatformBrowser(this.platformId)) {
    window.open('https://wa.me/914426862365?', '_blank');
    }
  }
}
