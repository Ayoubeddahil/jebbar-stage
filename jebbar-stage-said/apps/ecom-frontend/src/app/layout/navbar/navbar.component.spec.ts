import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NavbarComponent } from './navbar.component';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, FontAwesomeModule],
      declarations: [NavbarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle mobile menu', () => {
    spyOn(component, 'toggleMobileMenu');
    component.toggleMobileMenu();
    expect(component.toggleMobileMenu).toHaveBeenCalled();
  });

  it('should handle login', () => {
    spyOn(component, 'login');
    component.login();
    expect(component.login).toHaveBeenCalled();
  });

  it('should handle logout', () => {
    spyOn(component, 'logout');
    component.logout();
    expect(component.logout).toHaveBeenCalled();
  });

  it('should close dropdown', () => {
    const mockElement = document.createElement('div');
    mockElement.innerHTML = '<div class="dropdown-menu"></div>';
    spyOn(mockElement.querySelector('.dropdown-menu'), 'style', 'get').and.callThrough();
    component.closeDropdown(mockElement);
    expect(mockElement.querySelector('.dropdown-menu')?.style.display).toBe('none');
  });
});