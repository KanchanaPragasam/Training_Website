import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  private url = 'https://wp4.inspirationcs.ca/api/send-mail.php';

  constructor(private http: HttpClient) { }

  // sendMail(formData: any, formType: 'enrollment' | 'contact' | 'enquiry') {
  //   const payload = {
  //     ...formData,
  //     formType
  //   };
  //   console.log('comes to sendmal',formType,formData,payload);
    
  //   return this.http.post(this.url, payload);
  // }


  sendMail(formData: any, formType: 'enrollment' | 'contact' | 'enquiry') {
  const uploadData = new FormData();
    
  Object.keys(formData).forEach(key => {
    if (key === 'resume') {
      uploadData.append('resume', formData[key]); // file upload
    } else {
      uploadData.append(key, formData[key]);
    }
  });
  uploadData.append('formType', formType);
  return this.http.post(this.url, uploadData);
}

}
