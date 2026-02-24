import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { inject } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { FunctionReport } from '../../shared/models/models';
import { GiftReceivedFormDialogComponent } from '../../gifts/gift-received-form-dialog/gift-received-form-dialog.component';

@Component({
  selector: 'app-function-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,    // ← add this
  imports: [
    CommonModule, RouterModule, MatCardModule, MatTableModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatDialogModule,
  ],
  template: `
    <div class="page" id="printable">

      <div class="page-header no-print">
        <div>
          <button mat-icon-button routerLink="/functions"><mat-icon>arrow_back</mat-icon></button>
          <span class="page-title">{{ report?.function?.name }}</span>
          <span class="subtitle">&nbsp;{{ report?.function?.eventDate | date:'dd MMM yyyy' }}</span>
        </div>
        <div class="actions">
          <button mat-raised-button color="accent" (click)="openAddGift()">
            <mat-icon>add</mat-icon> Add Gift
          </button>
          <button mat-raised-button color="primary" (click)="print()">
            <mat-icon>print</mat-icon> Print A4
          </button>
        </div>
      </div>

      <!-- Print Header -->
      <div class="print-header print-only">
        <h1>{{ report?.function?.name }}</h1>
        <p>Date: {{ report?.function?.eventDate | date:'dd MMMM yyyy' }}</p>
        @if (report?.function?.description) {
          <p>{{ report?.function?.description }}</p>
        }
        <hr />
      </div>

      <!-- Summary Cards -->
      <div class="summary-row">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-val">{{ report?.summary?.totalCount || 0 }}</div>
            <div class="stat-label">Total Gifts</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card green">
          <mat-card-content>
            <div class="stat-val">₹{{ report?.summary?.totalCash || 0 | number:'1.0-0' }}</div>
            <div class="stat-label">Cash Received</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card orange">
          <mat-card-content>
            <div class="stat-val">{{ report?.summary?.totalVouchers || 0 }}</div>
            <div class="stat-label">Vouchers</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card blue">
          <mat-card-content>
            <div class="stat-val">{{ report?.summary?.totalItems || 0 }}</div>
            <div class="stat-label">Items</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Gifts Table -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>Gifts Received</mat-card-title>
        </mat-card-header>
        <table mat-table [dataSource]="gifts" class="full-w">
          <ng-container matColumnDef="sno">
            <th mat-header-cell *matHeaderCellDef>#</th>
            <td mat-cell *matCellDef="let g; let i = index">{{ i + 1 }}</td>
          </ng-container>
          <ng-container matColumnDef="person">
            <th mat-header-cell *matHeaderCellDef>Person</th>
            <td mat-cell *matCellDef="let g">
              <div>{{ g.person?.name }}</div>
              <small class="muted">{{ g.person?.address }}</small>
            </td>
          </ng-container>
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let g">
              <mat-chip [class]="'chip-' + g.giftType">{{ g.giftType | titlecase }}</mat-chip>
            </td>
          </ng-container>
          <ng-container matColumnDef="details">
            <th mat-header-cell *matHeaderCellDef>Gift Details</th>
            <td mat-cell *matCellDef="let g">
              @if (g.giftType === 'cash')    { ₹{{ g.amount | number:'1.0-0' }} }
              @if (g.giftType === 'voucher') { {{ g.voucherDetails }} }
              @if (g.giftType === 'item')    { {{ g.itemDescription }} (Qty: {{ g.quantity }}) }
            </td>
          </ng-container>
          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let g">{{ g.receivedDate | date:'dd/MM/yyyy' }}</td>
          </ng-container>
          <ng-container matColumnDef="notes">
            <th mat-header-cell *matHeaderCellDef>Notes</th>
            <td mat-cell *matCellDef="let g">{{ g.notes }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef class="no-print">Actions</th>
            <td mat-cell *matCellDef="let g" class="no-print">
              <button mat-icon-button color="warn" (click)="deleteGift(g.id)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols;"></tr>
        </table>
        @if (!gifts.length) {
          <div class="empty">No gifts recorded yet. Click "Add Gift" to begin.</div>
        }
      </mat-card>

      <div class="print-footer print-only">
        <p>Printed on: {{ today | date:'dd MMMM yyyy, hh:mm a' }}</p>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .page-title { font-size: 22px; font-weight: bold; }
    .subtitle { color: #666; }
    .actions { display: flex; gap: 8px; }
    .summary-row { display: flex; gap: 16px; margin-bottom: 20px; }
    .stat-card { flex: 1; text-align: center; }
    .stat-val { font-size: 30px; font-weight: 700; color: #3f51b5; }
    .stat-card.green .stat-val  { color: #2e7d32; }
    .stat-card.orange .stat-val { color: #e65100; }
    .stat-card.blue .stat-val   { color: #1565c0; }
    .stat-label { color: #666; font-size: 13px; }
    .full-w { width: 100%; }
    .muted { color: #999; font-size: 12px; }
    .empty { padding: 32px; text-align: center; color: #999; }
    ::ng-deep .chip-cash    { background: #c8e6c9 !important; }
    ::ng-deep .chip-voucher { background: #fff9c4 !important; }
    ::ng-deep .chip-item    { background: #bbdefb !important; }
    .print-only { display: none; }
    @media print {
      .no-print   { display: none !important; }
      .print-only { display: block !important; }
      .page { padding: 10mm; }
      .summary-row { flex-wrap: wrap; }
    }
  `],
})
export class FunctionDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);   // ← inject CDR

  report?: FunctionReport;
  gifts: any[] = [];                            // ← separate stable array for table
  functionId!: number;
  cols = ['sno', 'person', 'type', 'details', 'date', 'notes', 'actions'];
  today = new Date();

  ngOnInit() {
    this.functionId = +this.route.snapshot.params['id'];
    this.load();
  }

  load() {
    this.api.getFunctionReport(this.functionId).subscribe((data) => {
      this.report = data;
      this.gifts = data?.giftsReceived ?? [];  // ← assign stable reference
      this.cdr.markForCheck();                  // ← notify OnPush to re-render
    });
  }

  openAddGift() {
    const ref = this.dialog.open(GiftReceivedFormDialogComponent, {
      width: '560px',
      data: { functionId: this.functionId },
    });
    ref.afterClosed().subscribe((r) => { if (r) this.load(); });
  }

  deleteGift(id: number) {
    if (confirm('Remove this gift?')) {
      this.api.deleteGiftReceived(id).subscribe(() => this.load());
    }
  }

  print() { window.print(); }
}
