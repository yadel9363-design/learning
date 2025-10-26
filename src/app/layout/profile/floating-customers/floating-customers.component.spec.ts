import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingCustomersComponent } from './floating-customers.component';

describe('FloatingCustomersComponent', () => {
  let component: FloatingCustomersComponent;
  let fixture: ComponentFixture<FloatingCustomersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingCustomersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloatingCustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
