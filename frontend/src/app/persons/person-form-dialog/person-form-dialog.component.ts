import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../shared/services/api.service';
import { Person } from '../../shared/models/models';

@Component({
  selector: 'app-person-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Edit' : 'New' }} Person</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Full Name *</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Address</mat-label>
          <textarea matInput formControlName="address" rows="3"></textarea>
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Phone</mat-label>
          <input matInput formControlName="phone" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary"
        (click)="save()" [disabled]="form.invalid">
        {{ data ? 'Update' : 'Create' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form { min-width: 380px; display: flex; flex-direction: column; gap: 4px; }
    .w-full { width: 100%; }
  `],
})
export class PersonFormDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private ref = inject(MatDialogRef<PersonFormDialogComponent>);
  data = inject<Person | null>(MAT_DIALOG_DATA);

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    address: [''],
    phone: [''],
  });

  ngOnInit() { if (this.data) this.form.patchValue(this.data); }

  save() {
    if (this.form.invalid) return;
    const obs = this.data
      ? this.api.updatePerson(this.data.id, this.form.value)
      : this.api.createPerson(this.form.value);
    obs.subscribe(() => this.ref.close(true));
  }
}
