import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticlesComponent } from './articles.component';

describe('ArticlesComponent', () => {
  let component: ArticlesComponent;
  let fixture: ComponentFixture<ArticlesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [ArticlesComponent]
});
    fixture = TestBed.createComponent(ArticlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
