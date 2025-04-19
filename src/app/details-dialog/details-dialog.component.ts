import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Event } from 'src/models/Event';
import { Member } from 'src/models/Member';
import { EventService } from 'src/services/event.service';
import { MemberService } from 'src/services/member.service';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Component({
    selector: 'app-details-dialog',
    templateUrl: './details-dialog.component.html',
    styleUrls: ['./details-dialog.component.css'],
    standalone: true,
    imports: [CommonModule, DatePipe, ProgressSpinnerModule]
})
export class DetailsDialogComponent implements OnInit {
  details: Event | Member | null = null;
  isLoading = true;
  errorLoading = false;
  itemType: 'event' | 'member' | null = null;

  constructor(
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private eventService: EventService,
    private memberService: MemberService
  ) {}

  ngOnInit(): void {
    const eventId = this.config.data?.eventId;
    const memberId = this.config.data?.memberId;

    let data$: Observable<Event | Member | null>;

    if (eventId) {
      this.itemType = 'event';
      data$ = this.eventService.getEvent(eventId);
    } else if (memberId) {
      this.itemType = 'member';
      data$ = this.memberService.getMember(memberId);
    } else {
      console.error("DetailsDialog: No ID provided in config data.");
      this.errorLoading = true;
      this.isLoading = false;
      data$ = of(null);
    }

     data$.pipe(
       tap(data => {
         this.details = data;
         this.isLoading = false;
         if (!data) {
           this.errorLoading = true;
         }
       }),
       catchError(err => {
         console.error(`Error loading ${this.itemType} details:`, err);
         this.errorLoading = true;
         this.isLoading = false;
         return of(null);
       })
     ).subscribe();
  }

   isEvent(item: Event | Member | null): item is Event {
    return item !== null && 'lieu' in item;
  }

  closeDialog(): void {
    this.ref.close();
  }
}
