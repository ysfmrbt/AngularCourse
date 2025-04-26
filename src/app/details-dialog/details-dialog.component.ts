import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Event } from 'src/models/Event';
import { Member } from 'src/models/Member';
import { EventService } from 'src/services/event.service';
import { MemberService } from 'src/services/member.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Component({
  selector: 'app-details-dialog',
  templateUrl: './details-dialog.component.html',
  styleUrls: ['./details-dialog.component.css'],
  standalone: true,
  imports: [CommonModule, DatePipe, ProgressSpinnerModule, ButtonModule],
})
export class DetailsDialogComponent implements OnInit {
  details: Event | Member | null = null;
  isLoading = true;
  errorLoading = false;
  itemType: 'event' | 'member' | null = null;

  @Input() itemId: string | null = null;
  @Input() type: 'event' | 'member' | null = null;
  @Output() closeDialog = new EventEmitter<void>();

  constructor(
    private eventService: EventService,
    private memberService: MemberService
  ) {}

  ngOnInit(): void {
    this.itemType = this.type;
    let data$: Observable<Event | Member | null>;

    if (this.type === 'event' && this.itemId) {
      data$ = this.eventService.getEvent(this.itemId);
    } else if (this.type === 'member' && this.itemId) {
      data$ = this.memberService.getMember(this.itemId);
    } else {
      console.error('DetailsDialog: No ID or type provided.');
      this.errorLoading = true;
      this.isLoading = false;
      data$ = of(null);
    }

    data$
      .pipe(
        tap((data) => {
          this.details = data;
          this.isLoading = false;
          if (!data) {
            this.errorLoading = true;
          }
        }),
        catchError((err) => {
          console.error(`Error loading ${this.itemType} details:`, err);
          this.errorLoading = true;
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe();
  }

  isEvent(item: Event | Member | null): item is Event {
    return item !== null && 'lieu' in item;
  }

  handleClose(): void {
    this.closeDialog.emit();
  }
}
