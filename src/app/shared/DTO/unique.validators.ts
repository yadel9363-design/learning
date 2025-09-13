import { AbstractControl, ValidationErrors } from "@angular/forms";

export class UniquenessValidator {
    // this shape  Promise<ValidationErrors>   to customize class specify the type
  static CheckUniqueValidator(control: AbstractControl): Promise<ValidationErrors | null> {

    /*
    promise take 2 parametars (resolve, reject)
    - this resolve use to call back function when will the method success
    - this reject use to call back function when will the method failed or problem
    */


    return new Promise((resolve) => {
      // محاكاة check في DB
      //semulation for excute check if username is already founded
      setTimeout(() => {
        if (control.value === 'youssef@gmail.com') {
          resolve({ existname: true });
        } else {
          resolve(null);
        }
      }, 2000);
    });
  }
}
