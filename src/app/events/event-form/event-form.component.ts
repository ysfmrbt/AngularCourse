import { Component, OnInit, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
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
      this.form.patchValue({
        titre: this.data.event.titre,
        lieu: this.data.event.lieu,
        date_debut: new Date(this.data.event.date_debut),
        date_fin: new Date(this.data.event.date_fin)
      });
    }
  }

  private initializeForm() {
    this.form = new FormGroup({
      titre: new FormControl('', [Validators.required]),
      lieu: new FormControl('', [Validators.required]),
      date_debut: new FormControl<Date | null>(null, [Validators.required]),
      date_fin: new FormControl<Date | null>(null, [Validators.required])
    }, { validators: this.dateRangeValidator() });
  }

  private dateRangeValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const start = group.get('date_debut')?.value;
      const end = group.get('date_fin')?.value;

      if (start && end) {
        return start < end ? null : { dateRange: true };
      }
      return null;
    };
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = {
        ...this.form.value,
        date_debut: this.form.value.date_debut.toISOString(),
        date_fin: this.form.value.date_fin.toISOString()
      };

      if (this.isEditMode) {
        this.eventService.updateEvent(String(this.data.event!.id), formValue)
          .subscribe(() => this.dialogRef.close(true));
      } else {
        this.eventService.addEvent(formValue)
          .subscribe(() => this.dialogRef.close(true));
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
