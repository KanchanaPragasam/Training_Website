import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

// Node-compatible DOMParser for SSR
let NodeDomParser: any;
try {
  NodeDomParser = require('xmldom').DOMParser;
} catch (err) {
  NodeDomParser = null;
}

@Injectable({
  providedIn: 'root'
})
export class XmlReaderService {
  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: Object) { }

  readXml(path: string): Observable<Document | null> {
    return this.http.get(path, { responseType: 'text' }).pipe(
      map(xmlStr => {
        try {
          if (isPlatformBrowser(this.platformId)) {
            // Browser: use native DOMParser
            return new DOMParser().parseFromString(xmlStr, 'text/xml');
          } else if (NodeDomParser) {
            // SSR: use xmldom parser
            const parser = new NodeDomParser();
            return parser.parseFromString(xmlStr, 'text/xml');
          } else {
            console.warn('No DOM parser available.');
            return null;
          }
        } catch (err) {
          console.error('XML parsing error:', err);
          return null;
        }
      }),
      catchError(err => {
        console.error('Error loading XML:', err);
        return of(null);
      })
    );
  }
}
