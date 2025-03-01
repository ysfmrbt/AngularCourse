import { Component, OnInit, ViewChild } from '@angular/core';
import { EventService } from 'src/services/event.service';
import { Event } from 'src/models/Event';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { EventFormComponent } from './event-form/event-form.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css'],
})
export class EventsComponent implements OnInit {
  displayedColumns: string[] = [
    'id',
    'titre',
    'lieu',
    'date_debut',
    'date_fin',
    'action',
  ];
  dataSource!: MatTableDataSource<Event>;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private eventService: EventService, private dialog: MatDialog) {
    this.dataSource = new MatTableDataSource<Event>([]);
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // Custom filter predicate to search across multiple columns
    this.dataSource.filterPredicate = (data: Event, filter: string) => {
      const searchStr = filter.toLowerCase();
      return (
        data.titre.toLowerCase().includes(searchStr) ||
        data.lieu.toLowerCase().includes(searchStr) ||
        data.id.toString().toLowerCase().includes(searchStr)
      );
    };
  }

  applyFilter(event: KeyboardEvent) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadEvents(): void {
    this.eventService.getAllEvents().subscribe((data: Event[]) => {
      this.dataSource.data = data;
    });
  }

  deleteEvent(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: { message: 'Voulez-vous supprimer cet événement ?' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.eventService.deleteEvent(id).subscribe(() => {
          this.loadEvents();
        });
      }
    });
  }

  openEventDialog(event?: Event) {
    const dialogRef = this.dialog.open(EventFormComponent, {
      width: '500px',
      data: { event: event }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEvents();
      }
    });
  }

  addEvent() {
    this.openEventDialog();
  }

  editEvent(event: Event) {
    this.openEventDialog(event);
  }
}
