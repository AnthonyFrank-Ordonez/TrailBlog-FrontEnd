import { Component } from '@angular/core';
import { CommunityList } from '@shared/components/community-list/community-list';

@Component({
  selector: 'app-communities',
  imports: [CommunityList],
  templateUrl: './communities.html',
  styleUrl: './communities.css',
})
export class Communities {}
