import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class SeoService {

  constructor(
    private titleService: Title,
    private meta: Meta,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) { }

  updateMetaData({
    title,
    description,
    image,
    url,
    robots = 'index, follow',
    canonical = url,
    schema,
  }: {
    title: string;
    description: string;
    image?: string;
    url?: string;
    robots?: string;
    canonical?: string;
    schema?: object;
  }) {
    // Update title and meta tags (SSR safe)
    this.titleService.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'robots', content: robots });

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image || '/assets/images/logo-croped.webp' });
    this.meta.updateTag({ property: 'og:url', content: url || '' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });

    // Twitter
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image || '/assets/images/logo-croped.webp' });

    // Only manipulate DOM if browser (for canonical & JSON-LD)
    if (isPlatformBrowser(this.platformId)) {
      if (canonical) this.setCanonicalURL(canonical);
      if (schema) this.setJSONLD(schema);
    }
  }

  private setCanonicalURL(url: string) {
    let link: HTMLLinkElement = this.document.querySelector('link[rel="canonical"]')!;
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setJSONLD(schemaObject: object) {
    const existingScripts = this.document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach((el) => el.remove());

    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaObject);
    this.document.head.appendChild(script);
  }
}
