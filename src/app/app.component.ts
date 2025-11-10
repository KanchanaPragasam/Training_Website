import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs';
import { SeoService } from './core/services/seo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object,  private router: Router,private seo: SeoService,
    private activatedRoute: ActivatedRoute,) {}

  ngOnInit() {
      this.handleDynamicSeo();
    if (isPlatformBrowser(this.platformId)) {
       import('bootstrap'); // Use 'bootstrap' directly
 
    }
  }
   private handleDynamicSeo() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => {
          let route = this.activatedRoute;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter(route => route.outlet === 'primary'),
        mergeMap(route => route.data)
      )
      .subscribe((data: any) => {
        // Each route can define SEO data in its route config
        if (data && data['seo']) {
          const seoData = data['seo'];
          this.seo.updateMetaData({
            title: seoData.title,
            description: seoData.description,
            url: `http://localhost:4000/${this.router.url}`,
            image: seoData.image,
            canonical: `http://localhost:4000/${this.router.url}`,
            schema: seoData.schema
          });
        }
      });
  }
}
