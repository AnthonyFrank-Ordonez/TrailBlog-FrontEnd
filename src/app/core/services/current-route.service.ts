import { inject, Injectable, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationExtras, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CurrentRouteService {
  private router = inject(Router);

  currentPath: Signal<string> = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  handleRedirection(path: string, extras?: NavigationExtras) {
    const command = Array.isArray(path) ? path : [path];
    this.router.navigate(command, extras);
  }
}
