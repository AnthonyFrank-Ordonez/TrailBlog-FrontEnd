import { Component, signal } from '@angular/core';
import { Blog } from 'src/app/core/models/interface/blogs';
import { BlogCard } from './blog-card/blog-card';
import { ZardDividerComponent } from '../divider/divider.component';

@Component({
  selector: 'app-blog-list',
  imports: [BlogCard, ZardDividerComponent],
  templateUrl: './blog-list.html',
  styleUrl: './blog-list.css',
})
export class BlogList {
  sampleBlogList = signal<Blog[]>([
    {
      id: 'b1e7c8a2-1f3d-4e7a-9c2b-1a2e3f4b5c6d',
      title: 'Exploring the Redwood Trails',
      communityName: 'Nature Lovers',
      totalLikes: 120,
      totalComments: 34,
      date: new Date('2024-06-01'),
      content: 'Discover the beauty of the redwood trails and tips for your next adventure.',
    },
    {
      id: 'c2f8d9b3-2e4e-5f8b-0d3c-2b3f4g5h6i7j',
      title: 'Mountain Biking Adventure',
      communityName: 'Cyclists United',
      totalLikes: 98,
      totalComments: 21,
      date: new Date('2024-05-28'),
      content: 'Join us as we tackle challenging mountain biking trails and share our experiences.',
    },
    {
      id: 'd3g9e0c4-3f5f-6g9c-1e4d-3c4g5h6i7j8k',
      title: 'Sunset at the Lake',
      communityName: 'Photography Club',
      totalLikes: 76,
      totalComments: 15,
      date: new Date('2024-05-25'),
      content: 'Capturing the perfect sunset at the lake—photography tips and best spots.',
    },
    {
      id: 'e4h0f1d5-4g6g-7h0d-2f5e-4d5h6i7j8k9l',
      title: 'Bird Watching Tips',
      communityName: 'Wildlife Enthusiasts',
      totalLikes: 54,
      totalComments: 9,
      date: new Date('2024-05-20'),
      content: 'Essential tips for beginner bird watchers and the best locations to visit.',
    },
    {
      id: 'f5i1g2e6-5h7h-8i1e-3g6f-5e6i7j8k9l0m',
      title: 'Trail Running for Beginners',
      communityName: 'Fitness Freaks',
      totalLikes: 87,
      totalComments: 18,
      date: new Date('2024-05-18'),
      content: 'A guide to getting started with trail running, including gear and safety advice.',
    },
    {
      id: 'a6j2h3f7-6i8i-9j2f-4h7g-6f7j8k9l0m1n',
      title: 'Camping Essentials',
      communityName: 'Outdoor Explorers',
      totalLikes: 65,
      totalComments: 12,
      date: new Date('2024-05-15'),
      content: 'Everything you need to pack for a successful and enjoyable camping trip.',
    },
    {
      id: 'b7k3i4g8-7j9j-0k3g-5i8h-7g8k9l0m1n2o',
      title: 'Best Hiking Boots Reviewed',
      communityName: 'Gear Heads',
      totalLikes: 102,
      totalComments: 27,
      date: new Date('2024-05-10'),
      content: 'Our top picks for hiking boots—comfort, durability, and value for money.',
    },
    {
      id: 'c8l4j5h9-8k0k-1l4h-6j9i-8h9l0m1n2o3p',
      title: 'Wildflower Season Highlights',
      communityName: 'Botany Buffs',
      totalLikes: 43,
      totalComments: 7,
      date: new Date('2024-05-08'),
      content: 'A look at the most beautiful wildflowers in bloom this season.',
    },
    {
      id: 'd9m5k6i0-9l1l-2m5i-7k0j-9i0m1n2o3p4q',
      title: 'Family Picnic Spots',
      communityName: 'Family Fun',
      totalLikes: 58,
      totalComments: 13,
      date: new Date('2024-05-05'),
      content: 'Top family-friendly picnic spots with activities for all ages.',
    },
    {
      id: 'e0n6l7j1-0m2m-3n6j-8l1k-0j1n2o3p4q5r',
      title: 'Night Hikes: What to Know',
      communityName: 'Adventure Seekers',
      totalLikes: 71,
      totalComments: 16,
      date: new Date('2024-05-01'),
      content: 'Safety tips and gear recommendations for hiking after dark.',
    },
  ]);
}
