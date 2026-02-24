import {
  Component, OnInit,
  ChangeDetectionStrategy, ChangeDetectorRef, inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ApiService } from '../../shared/services/api.service';
import { PersonReport, GiftReceived, GiftGiven } from '../../shared/models/models';
import { GiftGivenFormDialogComponent } from '../../gifts/gift-given-form-dialog/gift-given-form-dialog.component';
import { LocalDatePipe } from '../../shared/pipes/local-date.pipe';

@Component({
  selector: 'app-person-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatTableModule,
    MatButtonModule, MatIconModule, MatTabsModule, MatChipsModule, MatDialogModule, LocalDatePipe
  ],
  template: `
    <div class="page" id="printable">

      <!-- Toolbar -->
      <div class="page-header no-print">
        <div class="header-left">
          <button mat-icon-button routerLink="/persons">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div>
            <span class="page-title">{{ report?.person?.name }}</span>
            <div class="subtitle">{{ report?.person?.address }}</div>
          </div>
        </div>
        <div class="actions">
          <button mat-raised-button color="accent" (click)="openAddGiven()">
            <mat-icon>redeem</mat-icon> Add Gift Given
          </button>
          <button mat-raised-button color="primary" (click)="print()">
            <mat-icon>print</mat-icon> Print A4
          </button>
        </div>
      </div>

      <!-- Print Header -->
      <div class="print-only print-header">
        <h1>{{ report?.person?.name }}</h1>
        <p>{{ report?.person?.address }}
          @if (report?.person?.phone) { &nbsp;|&nbsp; {{ report?.person?.phone }} }
        </p>
        <hr />
      </div>

      <!-- Summary Cards -->
      <div class="summary-row">
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-val">{{ report?.summary?.totalReceived || 0 }}</div>
            <div class="stat-label">Received</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card green">
          <mat-card-content>
            <div class="stat-val">
              ₹{{ report?.summary?.totalCashReceived || 0 | number:'1.0-0' }}
            </div>
            <div class="stat-label">Cash Received</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card red">
          <mat-card-content>
            <div class="stat-val">{{ report?.summary?.totalGiven || 0 }}</div>
            <div class="stat-label">Given</div>
          </mat-card-content>
        </mat-card>
        <mat-card class="stat-card orange">
          <mat-card-content>
            <div class="stat-val">
              ₹{{ report?.summary?.totalCashGiven || 0 | number:'1.0-0' }}
            </div>
            <div class="stat-label">Cash Given</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Tabs -->
      <mat-tab-group>
        <!-- Gifts Received -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>south_west</mat-icon>&nbsp;Gifts Received
            ({{ giftsReceived.length }})
          </ng-template>
          <mat-card class="tab-card">
            <table mat-table [dataSource]="giftsReceived" class="full-w">
              <ng-container matColumnDef="sno">
                <th mat-header-cell *matHeaderCellDef>#</th>
                <td mat-cell *matCellDef="let g; let i = index">{{ i + 1 }}</td>
              </ng-container>
              <ng-container matColumnDef="function">
                <th mat-header-cell *matHeaderCellDef>Function</th>
                <td mat-cell *matCellDef="let g">{{ g.function?.name }}</td>
              </ng-container>
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let g">
                  <mat-chip [class]="'chip-' + g.giftType">
                    {{ g.giftType | titlecase }}
                  </mat-chip>
                </td>
              </ng-container>
              <ng-container matColumnDef="details">
                <th mat-header-cell *matHeaderCellDef>Details</th>
                <td mat-cell *matCellDef="let g">
                  @if (g.giftType === 'cash')    { ₹{{ g.amount | number:'1.0-0' }} }
                  @if (g.giftType === 'voucher') { {{ g.voucherDetails }} }
                  @if (g.giftType === 'item')    { {{ g.itemDescription }} (Qty: {{ g.quantity }}) }
                </td>
              </ng-container>
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let g">
                  {{ g.receivedDate | localDate:'dd/MM/yyyy' }}
                </td>
              </ng-container>
              <ng-container matColumnDef="notes">
                <th mat-header-cell *matHeaderCellDef>Notes</th>
                <td mat-cell *matCellDef="let g">{{ g.notes }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="receivedCols"></tr>
              <tr mat-row *matRowDef="let row; columns: receivedCols;"></tr>
            </table>
            @if (!giftsReceived.length) {
              <div class="empty">No gifts received recorded.</div>
            }
          </mat-card>
        </mat-tab>

        <!-- Gifts Given -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>north_east</mat-icon>&nbsp;Gifts Given
            ({{ giftsGiven.length }})
          </ng-template>
          <mat-card class="tab-card">
            <table mat-table [dataSource]="giftsGiven" class="full-w">
              <ng-container matColumnDef="sno">
                <th mat-header-cell *matHeaderCellDef>#</th>
                <td mat-cell *matCellDef="let g; let i = index">{{ i + 1 }}</td>
              </ng-container>
              <ng-container matColumnDef="functionName">
                <th mat-header-cell *matHeaderCellDef>Function</th>
                <td mat-cell *matCellDef="let g">{{ g.functionName }}</td>
              </ng-container>
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let g">
                  <mat-chip [class]="'chip-' + g.giftType">
                    {{ g.giftType | titlecase }}
                  </mat-chip>
                </td>
              </ng-container>
              <ng-container matColumnDef="details">
                <th mat-header-cell *matHeaderCellDef>Details</th>
                <td mat-cell *matCellDef="let g">
                  @if (g.giftType === 'cash')    { ₹{{ g.amount | number:'1.0-0' }} }
                  @if (g.giftType === 'voucher') { {{ g.voucherDetails }} }
                  @if (g.giftType === 'item')    { {{ g.itemDescription }} (Qty: {{ g.quantity }}) }
                </td>
              </ng-container>
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let g">
                  {{ g.givenDate | localDate:'dd/MM/yyyy' }}
                </td>
              </ng-container>
              <ng-container matColumnDef="notes">
                <th mat-header-cell *matHeaderCellDef>Notes</th>
                <td mat-cell *matCellDef="let g">{{ g.notes }}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="no-print">Actions</th>
                <td mat-cell *matCellDef="let g" class="no-print">
                  <button mat-icon-button color="warn" (click)="deleteGiven(g.id)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="givenCols"></tr>
              <tr mat-row *matRowDef="let row; columns: givenCols;"></tr>
            </table>
            @if (!giftsGiven.length) {
              <div class="empty">No gifts given recorded.</div>
            }
          </mat-card>
        </mat-tab>
      </mat-tab-group>

      <!-- Print Footer -->
      <div class="print-footer print-only">
        <p>Printed on: {{ today | date:'dd MMMM yyyy, hh:mm a' }}</p>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; }
    .page-header {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 20px;
    }
    .header-left { display: flex; align-items: center; gap: 8px; }
    .page-title { font-size: 22px; font-weight: bold; }
    .subtitle { color: #666; font-size: 13px; }
    .actions { display: flex; gap: 8px; }
    .summary-row { display: flex; gap: 16px; margin-bottom: 20px; }
    .stat-card { flex: 1; text-align: center; }
    .stat-val { font-size: 30px; font-weight: 700; color: #3f51b5; }
    .stat-card.green .stat-val  { color: #2e7d32; }
    .stat-card.red .stat-val    { color: #c62828; }
    .stat-card.orange .stat-val { color: #e65100; }
    .stat-label { color: #666; font-size: 13px; }
    .tab-card { border-radius: 0; }
    .full-w { width: 100%; }
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
export class PersonDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  report?: PersonReport;
  giftsReceived: GiftReceived[] = [];
  giftsGiven: GiftGiven[] = [];
  receivedCols = ['sno', 'function', 'type', 'details', 'date', 'notes'];
  givenCols = ['sno', 'functionName', 'type', 'details', 'date', 'notes', 'actions'];
  today = new Date();

  ngOnInit() { this.loadReport(); }

  loadReport() {
    const id = +this.route.snapshot.params['id'];
    this.api.getPersonReport(id).subscribe((data) => {
      this.report = data;
      this.giftsReceived = data?.giftsReceived ?? [];
      this.giftsGiven = data?.giftsGiven ?? [];
      this.cdr.markForCheck();
    });
  }

  openAddGiven() {
    const ref = this.dialog.open(GiftGivenFormDialogComponent, {
      width: '560px',
      data: { personId: this.report!.person.id },
    });
    ref.afterClosed().subscribe((r) => { if (r) this.loadReport(); });
  }

  deleteGiven(id: number) {
    if (confirm('Remove this gift?')) {
      this.api.deleteGiftGiven(id).subscribe(() => this.loadReport());
    }
  }

  print() { window.print(); }
}
