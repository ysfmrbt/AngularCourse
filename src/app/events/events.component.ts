import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  ElementRef,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { EventService } from 'src/services/event.service';
import { Event } from 'src/models/Event';
import { Subject, fromEvent } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  takeUntil,
} from 'rxjs/operators';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { EventFormComponent } from './event-form/event-form.component';

// PrimeNG Imports
import { Table, TableModule } from 'primeng/table';
import { ButtonModule, Button } from 'primeng/button';
import { InputTextModule, InputText } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ConfirmDialogModule,
    ToastModule,
    IconFieldModule,
    InputIconModule,
    DialogModule,
    EventFormComponent,
    DatePipe,
  ],
})
export class EventsComponent implements OnInit, AfterViewInit, OnDestroy {
  events: Event[] = [];
  loading: boolean = true;

  @ViewChild('dt') dt!: Table;
  @ViewChild('input') input!: ElementRef;

  private destroy$ = new Subject<void>();

  // Dialog visibility flags
  eventDialogVisible: boolean = false;
  detailsDialogVisible: boolean = false;
  selectedEvent: Event | null = null;

  constructor(
    private eventService: EventService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadEvents();
  }

  ngAfterViewInit() {
    fromEvent(this.input.nativeElement, 'keyup')
      .pipe(
        map(() => this.input.nativeElement.value),
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((filterValue) => {
        this.applyFilter(filterValue);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  applyFilter(filterValue: string) {
    this.dt.filterGlobal(filterValue.trim().toLowerCase(), 'contains');
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getAllEvents().subscribe((data: Event[]) => {
      this.events = data;
      this.loading = false;
    });
  }

  deleteEvent(id: string) {
    this.confirmationService.confirm({
      message: 'Voulez-vous vraiment supprimer cet événement ?',
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Oui, supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.eventService.deleteEvent(id).subscribe(
          () => {
            this.loadEvents();
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Événement supprimé',
            });
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: "Impossible de supprimer l'événement",
            });
            console.error('Error deleting event:', error);
          }
        );
      },
      reject: () => {
        // this.confirmationService.close(); // Close is usually handled automatically
      },
    });
  }

  viewEvent(id: string) {
    this.eventService.getEvent(id).subscribe((event) => {
      this.selectedEvent = event;
      this.detailsDialogVisible = true;
    });
  }

  editEvent(event: Event) {
    console.log('Original event:', event);

    // Create a new object with explicit properties
    this.selectedEvent = {
      id: event.id,
      titre: event.titre,
      lieu: event.lieu,
      date_debut: event.date_debut,
      date_fin: event.date_fin,
    };

    console.log('Selected event with explicit properties:', this.selectedEvent);
    this.eventDialogVisible = true;
  }

  addEvent() {
    this.selectedEvent = null;
    this.eventDialogVisible = true;
  }

  onEventDialogClose(result: boolean) {
    this.eventDialogVisible = false;
    if (result) {
      this.loadEvents();
    }
  }

  onDetailsDialogClose() {
    this.detailsDialogVisible = false;
  }
}
