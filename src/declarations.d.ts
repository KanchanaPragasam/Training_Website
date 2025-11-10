declare module 'country-telephone-data' {
  export const allCountries: {
    name: string;
    iso2: string;
    dialCode: string;
    format: string;
    priority: number;
    areaCodes?: string[];
  }[];
}