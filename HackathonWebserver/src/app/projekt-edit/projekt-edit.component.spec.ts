import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjektEditComponent } from './projekt-edit.component';

describe('ProjektEditComponent', () => {
  let component: ProjektEditComponent;
  let fixture: ComponentFixture<ProjektEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjektEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjektEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
