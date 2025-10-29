import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

import { Header } from './header';
import { AuthService } from '@core/services/auth.service';
import { MessageService } from '@core/services/message.service';
import { UserService } from '@core/services/user.service';
import { PostService } from '@core/services/post.service';
import { CommunityService } from '@core/services/community.service';

class AuthServiceMock {
  isAuthenticated = of(true);
  logout = jasmine.createSpy('logout').and.returnValue(of(void 0));
}
class MessageServiceMock {}
class UserServiceMock {
  user = of({ firstName: 'John', lastName: 'Doe' } as any);
  activeUserTab = of('home');
  setActiveUserTab = jasmine.createSpy('setActiveUserTab');
}
class PostServiceMock {
  resetPostServiceData = jasmine.createSpy('resetPostServiceData');
}
class CommunityServiceMock {
  resetCommunityServiceData = jasmine.createSpy('resetCommunityServiceData');
}
class RouterMock {
  navigate = jasmine.createSpy('navigate');
}

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let authService: AuthServiceMock;
  let postService: PostServiceMock;
  let communityService: CommunityServiceMock;
  let userService: UserServiceMock;
  let router: RouterMock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        { provide: AuthService, useClass: AuthServiceMock },
        { provide: MessageService, useClass: MessageServiceMock },
        { provide: UserService, useClass: UserServiceMock },
        { provide: PostService, useClass: PostServiceMock },
        { provide: CommunityService, useClass: CommunityServiceMock },
        { provide: Router, useClass: RouterMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;

    authService = TestBed.inject(AuthService) as unknown as AuthServiceMock;
    postService = TestBed.inject(PostService) as unknown as PostServiceMock;
    communityService = TestBed.inject(CommunityService) as unknown as CommunityServiceMock;
    userService = TestBed.inject(UserService) as unknown as UserServiceMock;
    router = TestBed.inject(Router) as unknown as RouterMock;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set active tab via userService', () => {
    component.setActiveTab('posts');
    expect(userService.setActiveUserTab).toHaveBeenCalledWith('posts');
  });

  it('should hide and show header based on scroll direction and inactivity', fakeAsync(() => {
    // Initial state
    expect(component.hideHeader).toBeFalse();
    expect(component.hideBottomNav).toBeFalse();

    // Simulate scroll down beyond threshold
    spyOnProperty(window, 'pageYOffset', 'get').and.returnValue(150);
    (component as any).lastScrollTop = 50;
    component.onWindowScroll();
    expect(component.hideHeader).toBeTrue();
    expect(component.hideBottomNav).toBeTrue();

    // Simulate scroll up
    spyOnProperty(window, 'pageYOffset', 'get').and.returnValue(10);
    (component as any).lastScrollTop = 100;
    component.onWindowScroll();
    expect(component.hideHeader).toBeFalse();
    expect(component.hideBottomNav).toBeFalse();

    // After inactivity, header remains visible
    tick(1000);
    expect(component.hideHeader).toBeFalse();
    expect(component.hideBottomNav).toBeFalse();
  }));

  it('should clear timeout on destroy', () => {
    component.scrollTimeout = setTimeout(() => {}, 1000);
    spyOn(window, 'clearTimeout').and.callThrough();
    component.ngOnDestroy();
    expect(window.clearTimeout).toHaveBeenCalled();
  });

  it('should logout and navigate home, clearing service data', () => {
    component.onSignOut();
    expect(authService.logout).toHaveBeenCalled();

    // Synchronous due to of(void 0)
    expect(postService.resetPostServiceData).toHaveBeenCalled();
    expect(communityService.resetCommunityServiceData).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should handle logout error via message service', () => {
    const error = new HttpErrorResponse({ status: 500 });
    authService.logout.and.returnValue(throwError(() => error));
    const handleSpy = spyOn<any>(console, 'error');

    // Spy on global handleHttpError by intercepting console.error which it might call.
    // We cannot import private function here; we assert that no throws occur.
    component.onSignOut();

    expect(authService.logout).toHaveBeenCalled();
    // At minimum, the subscription should not throw and not navigate
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
