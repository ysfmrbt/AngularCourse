import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EventService } from 'src/services/event.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Event } from 'src/models/Event';

@Component({
  selector: 'app-event-form',
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.css'],
})
export class EventFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode = false;

  constructor(
    private eventService: EventService,
    private dialogRef: MatDialogRef<EventFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { event?: Event }
  ) {}

  ngOnInit() {
    this.initializeForm();
    if (this.data?.event) {
      this.isEditMode = true;
      this.form.patchValue(this.data.event);
    }
  }

  private initializeForm() {
    this.form = new FormGroup({
      titre: new FormControl(''),
      lieu: new FormControl(''),
      date_debut: new FormControl(''),
      date_fin: new FormControl(''),
    });
  }

  onSubmit() {
    if (this.form.valid) {
      if (this.isEditMode) {
        this.eventService.updateEvent(String(this.data.event!.id), this.form.value)
          .subscribe(() => this.dialogRef.close(true));
      } else {
        this.eventService.addEvent(this.form.value)
          .subscribe(() => this.dialogRef.close(true));
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
