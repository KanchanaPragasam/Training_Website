import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class OrdinalDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: any): string {
    if (displayFormat === 'ordinalDate') {
      const day = date.getDate();
      const suffix =
        day % 10 === 1 && day !== 11 ? 'st' :
        day % 10 === 2 && day !== 12 ? 'nd' :
        day % 10 === 3 && day !== 13 ? 'rd' : 'th';

      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();

      return `${day}${suffix} ${month} ${year}`;
    }

    return super.format(date, displayFormat);
  }
}