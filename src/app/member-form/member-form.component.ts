import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MemberService } from 'src/services/member.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Member } from 'src/models/Member';

@Component({
  selector: 'app-member-form',
  templateUrl: './member-form.component.html',
  styleUrls: ['./member-form.component.css'],
})
export class MemberFormComponent implements OnInit {
  form!: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private memberService: MemberService,
    private dialogRef: MatDialogRef<MemberFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { member?: Member }
  ) {}

  ngOnInit() {
    this.initializeForm();
    if (this.data?.member) {
      this.isEditMode = true;
      this.form.patchValue(this.data.member);
    }
  }

  private initializeForm() {
    this.form = this.fb.group({
      cin: ['', [Validators.required, Validators.minLength(8)]],
      nom: ['', [Validators.required, Validators.minLength(3)]],
      type: ['', Validators.required],
      createDate: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const memberData = this.form.value;
      const operation = this.isEditMode
        ? this.memberService.editMember(this.data.member!.id, memberData)
        : this.memberService.addMember(memberData);

      operation.subscribe({
        next: () => this.dialogRef.close(true),
        error: (error) => console.error('Error saving member:', error)
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
