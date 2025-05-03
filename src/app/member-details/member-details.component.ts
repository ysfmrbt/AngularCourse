import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Member } from 'src/models/Member';
import { MemberService } from 'src/services/member.service';
import { MemberPublicationsComponent } from '../member-publications/member-publications.component';

// PrimeNG Imports
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-member-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    ButtonModule,
    TabViewModule,
    ToastModule,
    MemberPublicationsComponent
  ],
  templateUrl: './member-details.component.html',
  styleUrls: ['./member-details.component.css']
})
export class MemberDetailsComponent implements OnInit {
  memberId: string = '';
  member: Member | null = null;
  loading: boolean = true;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private memberService: MemberService,
    private messageService: MessageService
  ) { }
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.memberId = params['id'];
      this.loadMember();
    });
  }
  
  loadMember(): void {
    this.loading = true;
    this.memberService.getMember(this.memberId).subscribe({
      next: (data) => {
        this.member = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading member:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load member details'
        });
        this.loading = false;
      }
    });
  }
  
  goBack(): void {
    this.router.navigate(['/members']);
  }
}
