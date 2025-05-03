import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Member } from 'src/models/Member';
import { Pub } from 'src/models/Pub';
import { MemberService } from 'src/services/member.service';
import { PubService } from 'src/services/pub.service';

// PrimeNG Imports
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-publication-assignment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    ButtonModule,
    CardModule,
    ToastModule,
    TableModule
  ],
  templateUrl: './publication-assignment.component.html',
  styleUrls: ['./publication-assignment.component.css']
})
export class PublicationAssignmentComponent implements OnInit {
  members: Member[] = [];
  publications: Pub[] = [];
  unassignedPublications: Pub[] = [];
  
  selectedMember: Member | null = null;
  selectedPublication: Pub | null = null;
  
  loading = {
    members: false,
    publications: false,
    assignment: false
  };
  
  constructor(
    private memberService: MemberService,
    private pubService: PubService,
    private messageService: MessageService
  ) { }
  
  ngOnInit(): void {
    this.loadMembers();
    this.loadPublications();
  }
  
  loadMembers(): void {
    this.loading.members = true;
    this.memberService.getAllMembers().subscribe({
      next: (data) => {
        this.members = data;
        this.loading.members = false;
      },
      error: (error) => {
        console.error('Error loading members:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load members'
        });
        this.loading.members = false;
      }
    });
  }
  
  loadPublications(): void {
    this.loading.publications = true;
    this.pubService.getAllPubs().subscribe({
      next: (data) => {
        this.publications = data;
        this.updateUnassignedPublications();
        this.loading.publications = false;
      },
      error: (error) => {
        console.error('Error loading publications:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load publications'
        });
        this.loading.publications = false;
      }
    });
  }
  
  updateUnassignedPublications(): void {
    this.unassignedPublications = this.publications.filter(pub => !pub.memberId);
  }
  
  onMemberChange(): void {
    this.selectedPublication = null;
  }
  
  assignPublication(): void {
    if (!this.selectedMember || !this.selectedPublication) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select both a member and a publication'
      });
      return;
    }
    
    this.loading.assignment = true;
    
    // First, update the publication with the member ID
    this.pubService.assignPublicationToMember(this.selectedPublication.id, this.selectedMember.id)
      .subscribe({
        next: () => {
          // Then, add the publication to the member's publications array
          this.memberService.addPublicationToMember(this.selectedMember!.id, this.selectedPublication!.id)
            .subscribe({
              next: () => {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: 'Publication assigned to member'
                });
                
                // Refresh data
                this.loadPublications();
                this.selectedPublication = null;
                this.loading.assignment = false;
              },
              error: (error) => {
                console.error('Error adding publication to member:', error);
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Failed to update member'
                });
                this.loading.assignment = false;
              }
            });
        },
        error: (error) => {
          console.error('Error assigning publication:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to assign publication'
          });
          this.loading.assignment = false;
        }
      });
  }
}
