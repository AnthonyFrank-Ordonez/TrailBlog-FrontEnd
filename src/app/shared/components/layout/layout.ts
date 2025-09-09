import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { SideNavigation } from '../side-navigation/side-navigation';

@Component({
  selector: 'app-layout',
  imports: [Header, SideNavigation],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {}
