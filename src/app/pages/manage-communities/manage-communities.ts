import { Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Communities } from '@core/models/interface/community';
import { CommunityService } from '@core/services/community.service';
import { CommunityList } from '@shared/components/community-list/community-list';
import { debounce } from '@shared/utils/utils';

@Component({
  selector: 'app-manage-communities',
  imports: [CommunityList, ReactiveFormsModule],
  templateUrl: './manage-communities.html',
  styleUrl: './manage-communities.css',
})
export class ManageCommunities implements OnInit {
  private communityService = inject(CommunityService);
  private destroyRef = inject(DestroyRef);

  userCommunities = this.communityService.userCommunities;
  searchControl = new FormControl('');
  searchTerm = signal<string>('');
  // filteredUserCommunities = signal<Communities[]>([]);

  filteredUserCommunities = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const communities = this.userCommunities();

    if (!term) return communities;

    return communities.filter(
      (community) =>
        community.communityName.toLowerCase().includes(term) ||
        community.description?.toLowerCase().includes(term),
    );
  });

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(debounce(this.destroyRef, 400))
      .subscribe((value) => this.searchTerm.set(value || ''));
  }
}
