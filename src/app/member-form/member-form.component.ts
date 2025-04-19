import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MemberService } from 'src/services/member.service';
import { Member } from 'src/models/Member';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-member-form',
  templateUrl: './member-form.component.html',
  styleUrls: ['./member-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule
  ]
})
export class MemberFormComponent implements OnInit {
  memberForm: FormGroup;
  isEditMode = false;
  memberId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private memberService: MemberService,
    public ref: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private messageService: MessageService
  ) {
    this.memberForm = this.fb.group({
      cin: ['', [Validators.required, Validators.minLength(8)]],
      nom: ['', Validators.required],
      type: ['', Validators.required],
      createDate: [{value: null, disabled: true}]
    });
  }

  ngOnInit() {
    const memberToEdit = this.config.data?.member;
    if (memberToEdit) {
      this.isEditMode = true;
      this.memberId = memberToEdit.id;
      const patchData = {
        ...memberToEdit,
        createDate: memberToEdit.createDate ? new Date(memberToEdit.createDate).toLocaleDateString() : null
      };
      this.memberForm.patchValue(patchData);
      this.memberForm.get('createDate')?.disable();
    } else {
      this.memberForm.removeControl('createDate');
    }
  }

  onSubmit(): void {
    if (this.memberForm.invalid) {
      this.memberForm.markAllAsTouched();
      this.messageService.add({severity:'warn', summary: 'Attention', detail: 'Veuillez corriger les erreurs dans le formulaire.'});
      return;
    }

    const formValue = this.memberForm.getRawValue();
    const { createDate, ...memberData } = formValue;

    const operation = this.isEditMode && this.memberId
      ? this.memberService.editMember(this.memberId, memberData as Member)
      : this.memberService.addMember(memberData as Member);

    operation.subscribe({
      next: () => {
        const successMsg = this.isEditMode ? 'Membre mis à jour' : 'Membre ajouté';
        this.messageService.add({severity:'success', summary: 'Succès', detail: successMsg });
        this.ref.close(true);
      },
      error: (error) => {
        console.error('Error saving member:', error);
        this.messageService.add({severity:'error', summary: 'Erreur', detail: 'Impossible d\'enregistrer le membre.'});
      }
    });
  }

  onCancel(): void {
    this.ref.close();
  }
}
