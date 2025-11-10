import { Directive, ElementRef, HostBinding, OnDestroy, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appAnimateOnScroll]',
  standalone: false
})
export class AnimateOnScrollDirective implements OnInit, OnDestroy {
  @HostBinding('class.animate-on-scroll') baseClass = true;
  private observer!: IntersectionObserver;

  constructor(
    private el: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object // Inject platformId
  ) {}

  ngOnInit() {
    // Wrap the browser-specific IntersectionObserver logic
    if (isPlatformBrowser(this.platformId)) {
      this.observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.el.nativeElement.classList.add('visible');
            this.observer.unobserve(this.el.nativeElement); 
          }
        });
      }, { threshold: 0.2 });

      this.observer.observe(this.el.nativeElement);
    }
  }

  ngOnDestroy() {
    // Ensure disconnect is only called if observer was initialized in the browser
    if (isPlatformBrowser(this.platformId) && this.observer) {
      this.observer.disconnect();
    }
  }
}
