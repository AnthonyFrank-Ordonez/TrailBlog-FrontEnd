import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { SideNavigation } from '../side-navigation/side-navigation';
import { RecentView } from '../recent-view/recent-view';
import { RightSidebar } from '../right-sidebar/right-sidebar';

@Component({
  selector: 'app-layout',
  imports: [Header, SideNavigation, RouterOutlet, RightSidebar],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {}
