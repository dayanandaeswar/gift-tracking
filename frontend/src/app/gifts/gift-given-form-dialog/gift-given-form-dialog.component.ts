import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../shared/services/api.service';

@Component({
  selector: 'app-gift-given-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule],
  template: `
    <h2 mat-dialog-title>Add Gift Given</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Function Name *</mat-label>
          <input matInput formControlName="functionName" placeholder="e.g. Suresh's Birthday" />
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Gift Type *</mat-label>
          <mat-select formControlName="giftType">
            <mat-option value="cash">💰 Cash</mat-option>
            <mat-option value="voucher">🎟 Voucher</mat-option>
            <mat-option value="item">🎁 Item</mat-option>
          </mat-select>
        </mat-form-field>
        @if (form.get('giftType')?.value === 'cash') {
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Amount (₹)</mat-label>
            <input matInput type="number" formControlName="amount" />
          </mat-form-field>
        }
        @if (form.get('giftType')?.value === 'voucher') {
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Voucher Details</mat-label>
            <input matInput formControlName="voucherDetails" />
          </mat-form-field>
        }
        @if (form.get('giftType')?.value === 'item') {
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Item Description</mat-label>
            <input matInput formControlName="itemDescription" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Quantity</mat-label>
            <input matInput type="number" formControlName="quantity" />
          </mat-form-field>
        }
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Date</mat-label>
          <input matInput [matDatepicker]="dp" formControlName="givenDate" />
          <mat-datepicker-toggle matSuffix [for]="dp" />
          <mat-datepicker #dp />
        </mat-form-field>
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Notes</mat-label>
          <textarea matInput formControlName="notes" rows="2"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid">Save</button>
    </mat-dialog-actions>
  `,
  styles: [`.form { min-width: 420px; display: flex; flex-direction: column; gap: 4px; } .w-full { width: 100%; }`],
})
export class GiftGivenFormDialogComponent {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private ref = inject(MatDialogRef<GiftGivenFormDialogComponent>);
  public data = inject<{ personId: number }>(MAT_DIALOG_DATA);

  form: FormGroup = this.fb.group({
    functionName: ['', Validators.required],
    giftType: ['cash', Validators.required],
    amount: [null],
    voucherDetails: [''],
    itemDescription: [''],
    quantity: [1],
    givenDate: [new Date()],
    notes: [''],
  });

  save() {
    if (this.form.invalid) return;
    this.api.createGiftGiven({ ...this.form.value, personId: this.data.personId })
      .subscribe(() => this.ref.close(true));
  }
}
