import { Component, ElementRef, HostListener, signal, ViewChild } from '@angular/core';

@Component({
  selector: 'app-create-post',
  imports: [],
  templateUrl: './create-post.html',
  styleUrl: './create-post.css',
})
export class CreatePost {
  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('formContainer') formContainer!: ElementRef;
  @ViewChild('toggleButton') toggleButton!: ElementRef;

  constructor(private elementRef: ElementRef) {}
  isCommunitySelectionSelected = signal<boolean>(false);

  showCommunitySelection(): void {
    this.isCommunitySelectionSelected.set(true);
    setTimeout(() => {
      if (this.searchInput) {
        this.searchInput.nativeElement.focus();
      }
    }, 0);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.isCommunitySelectionSelected()) return;

    const clickedInsideForm = this.formContainer?.nativeElement.contains(event.target);
    const clickedButton = this.toggleButton?.nativeElement.contains(event.target);

    if (!clickedInsideForm && !clickedButton) {
      this.isCommunitySelectionSelected.set(false);
    }
  }
}
