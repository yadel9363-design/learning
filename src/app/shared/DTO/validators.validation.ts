import { AbstractControl, ValidationErrors } from "@angular/forms";

export class TextValidator {
  static noSpaceAllowed(control: AbstractControl) : ValidationErrors | null
  {
    if ((control.value as string).indexOf(' ')!= -1) {
      return {noSpaceAllowed: true};
    }
    else {
      return null;
    }

  }
}
