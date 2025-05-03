import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Member } from 'src/models/Member';
import { Pub } from 'src/models/Pub';
import { MemberService } from 'src/services/member.service';
import { PubService } from 'src/services/pub.service';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-member-publications',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableModule,
    ButtonModule,
    CardModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './member-publications.component.html',
  styleUrls: ['./member-publications.component.css']
})
export class MemberPublicationsComponent implements OnInit, OnChanges {
  @Input() memberId: string = '';
  
  member: Member | null = null;
  publications: Pub[] = [];
  loading: boolean = true;
  
  constructor(
    private memberService: MemberService,
    private pubService: PubService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }
  
  ngOnInit(): void {
    if (this.memberId) {
      this.loadMemberWithPublications();
    }
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['memberId'] && !changes['memberId'].firstChange) {
      this.loadMemberWithPublications();
    }
  }
  
  loadMemberWithPublications(): void {
    this.loading = true;
    this.memberService.getMemberWithPublications(this.memberId)
      .subscribe({
        next: (data) => {
          this.member = data.member;
          this.publications = data.publications;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading member publications:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load member publications'
          });
          this.loading = false;
        }
      });
  }
  
  removePublication(pubId: string): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to remove this publication from the member?',
      header: 'Confirm Removal',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.memberService.removePublicationFromMember(this.memberId, pubId)
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Publication removed from member'
              });
              this.loadMemberWithPublications();
            },
            error: (error) => {
              console.error('Error removing publication:', error);
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to remove publication'
              });
            }
          });
      }
    });
  }
}
