import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MessageService } from '@core/services/message.service';
import { PostService } from '@core/services/post.service';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { TimeagoPipe } from '@shared/pipes/timeago-pipe';
import { handleHttpError } from '@shared/utils/utils';
import { tap } from 'rxjs';

@Component({
  selector: 'app-most-popular-posts',
  imports: [ZardDividerComponent, InitialsPipe, TimeagoPipe],
  templateUrl: './most-popular-posts.html',
  styleUrl: './most-popular-posts.css',
})
export class MostPopularPosts {
  private postService = inject(PostService);
  private messageService = inject(MessageService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  mostPopulatPosts = this.postService.mostPopularPosts;
  isMostPopularPostsLoading = this.postService.isMostPopularPostsLoading;
  skeletonArray = Array(5).fill(0);

  constructor() {
    this.postService
      .loadMostPopularPost()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }

  togglePopularPost(slug: string) {
    this.router.navigate(['/post', slug]);
  }
}
