import { Directive, HostListener, HostBinding, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appToggleArrow]',
  standalone: false
})
export class ToggleArrowDirective {

  @HostBinding('class.open') isOpen = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // Wrap HostListener logic
  @HostListener('focus') onFocus() {
    if (isPlatformBrowser(this.platformId)) {
      this.isOpen = true;
    }
  }

  @HostListener('blur') onBlur() {
    if (isPlatformBrowser(this.platformId)) {
      this.isOpen = false;
    }
  }
}
