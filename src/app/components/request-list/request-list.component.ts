import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TdbDataService } from '../../services/tdb-data.service';
import { TdbRequest, Category } from '../../models/tdb-request.model';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <div class="page-title">
          <h1>Requests</h1>
          <span class="count">{{ filteredRequests.length | number }}</span>
        </div>
      </div>

      <div class="toolbar">
        <div class="category-chips">
          <button
            class="chip"
            [class.active]="!activeCategory"
            (click)="filterByCategory(null)">
            All
          </button>
          <button
            *ngFor="let cat of categories"
            class="chip"
            [class.active]="activeCategory === cat.id"
            [attr.data-category]="cat.id"
            (click)="filterByCategory(cat.id)">
            {{ cat.name }}
            <span class="chip-count">{{ getCategoryCount(cat.id) }}</span>
          </button>
        </div>
        <div class="filter-row">
          <div class="filter-wrapper">
            <svg class="filter-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
            <input
              type="text"
              class="filter-input"
              placeholder="Filter by reqid, name, tags..."
              [(ngModel)]="filterText"
              (ngModelChange)="applyFilters()"
            />
          </div>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th (click)="sort('reqid')" class="sortable col-reqid">
                ReqID <span class="sort-indicator" [textContent]="getSortIcon('reqid')"></span>
              </th>
              <th (click)="sort('name')" class="sortable col-name">
                Name <span class="sort-indicator" [textContent]="getSortIcon('name')"></span>
              </th>
              <th (click)="sort('category_id')" class="sortable col-cat">
                Category <span class="sort-indicator" [textContent]="getSortIcon('category_id')"></span>
              </th>
              <th class="col-handler">Handler</th>
              <th (click)="sort('usages')" class="sortable col-callers">
                Callers <span class="sort-indicator" [textContent]="getSortIcon('usages')"></span>
              </th>
              <th class="col-tags">Tags</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let req of paginatedRequests" [routerLink]="['/request', req.reqid]" class="row-link">
              <td class="cell-mono cell-reqid">{{ req.reqid }}</td>
              <td class="cell-name">{{ req.name }}</td>
              <td>
                <span class="badge" [attr.data-category]="req.category_id">
                  {{ getCategoryName(req.category_id) }}
                </span>
              </td>
              <td class="cell-mono cell-handler">
                <span *ngIf="req.handler" class="handler-name">{{ req.handler.program_name }}</span>
                <span *ngIf="!req.handler" class="text-muted">&mdash;</span>
              </td>
              <td class="cell-mono cell-callers">
                <span *ngIf="req.usages.length > 0" class="caller-count">{{ req.usages.length }}</span>
                <span *ngIf="req.usages.length === 0" class="text-muted">0</span>
              </td>
              <td class="cell-tags">
                <span *ngFor="let tag of req.tags.slice(0, 3)" class="tag">{{ tag }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" *ngIf="totalPages > 1">
        <div class="page-controls">
          <button class="page-btn" [disabled]="currentPage === 1" (click)="goToPage(1)">First</button>
          <button class="page-btn" [disabled]="currentPage === 1" (click)="goToPage(currentPage - 1)">Prev</button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button class="page-btn" [disabled]="currentPage === totalPages" (click)="goToPage(currentPage + 1)">Next</button>
          <button class="page-btn" [disabled]="currentPage === totalPages" (click)="goToPage(totalPages)">Last</button>
        </div>
        <div class="page-size">
          <select class="page-size-select" [(ngModel)]="pageSize" (ngModelChange)="onPageSizeChange()">
            <option [value]="50">50</option>
            <option [value]="100">100</option>
            <option [value]="250">250</option>
            <option [value]="500">500</option>
          </select>
          <span class="page-size-label">per page</span>
        </div>
      </div>

      <div *ngIf="filteredRequests.length === 0" class="empty-state">
        No requests match your filters.
      </div>
    </div>
  `,
  styles: [`
    .container { padding: var(--sp-6); }

    .page-header { margin-bottom: var(--sp-5); }
    .page-title { display: flex; align-items: baseline; gap: var(--sp-3); }
    .page-title h1 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--ink-primary);
      letter-spacing: -0.01em;
    }
    .count {
      font-family: var(--font-mono);
      font-size: 0.75rem;
      color: var(--ink-tertiary);
    }

    /* ── Toolbar ── */
    .toolbar { margin-bottom: var(--sp-5); }
    .category-chips {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-1);
      margin-bottom: var(--sp-3);
    }
    .chip {
      padding: var(--sp-1) var(--sp-3);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
      background: transparent;
      color: var(--ink-tertiary);
      cursor: pointer;
      font-family: var(--font-body);
      font-size: 0.6875rem;
      font-weight: 500;
      transition: all 0.12s;
      white-space: nowrap;
    }
    .chip:hover {
      border-color: var(--border-emphasis);
      color: var(--ink-secondary);
    }
    .chip.active {
      background: var(--accent-muted);
      border-color: var(--accent-dim);
      color: var(--accent);
    }
    .chip-count {
      margin-left: var(--sp-1);
      opacity: 0.5;
      font-family: var(--font-mono);
      font-size: 0.625rem;
    }

    .filter-row { display: flex; }
    .filter-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
      max-width: 380px;
    }
    .filter-icon {
      position: absolute;
      left: var(--sp-3);
      color: var(--ink-muted);
      pointer-events: none;
    }
    .filter-input {
      width: 100%;
      padding: var(--sp-2) var(--sp-3) var(--sp-2) var(--sp-8);
      background: var(--control-bg);
      border: 1px solid var(--control-border);
      border-radius: var(--radius-md);
      color: var(--ink-primary);
      font-family: var(--font-body);
      font-size: 0.8125rem;
      outline: none;
      transition: border-color 0.12s, box-shadow 0.12s;
    }
    .filter-input:focus {
      border-color: var(--border-focus);
      box-shadow: 0 0 0 2px var(--control-focus-ring);
    }
    .filter-input::placeholder { color: var(--ink-muted); }

    /* ── Table ── */
    .table-wrapper { overflow-x: auto; }
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table th {
      text-align: left;
      padding: var(--sp-2) var(--sp-3);
      border-bottom: 1px solid var(--border-emphasis);
      color: var(--ink-tertiary);
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      white-space: nowrap;
    }
    .sortable { cursor: pointer; user-select: none; }
    .sortable:hover { color: var(--accent); }
    .sort-indicator {
      font-size: 0.5625rem;
      margin-left: var(--sp-1);
      color: var(--accent);
    }
    .data-table td {
      padding: var(--sp-2) var(--sp-3);
      border-bottom: 1px solid var(--border-soft);
      color: var(--ink-secondary);
      font-size: 0.8125rem;
    }
    .row-link {
      cursor: pointer;
      transition: background 0.08s;
    }
    .row-link:hover td { background: var(--surface-1); }

    .cell-mono {
      font-family: var(--font-mono);
      font-size: 0.75rem;
    }
    .cell-reqid { color: var(--accent); font-weight: 500; }
    .cell-name {
      max-width: 320px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--ink-primary);
    }
    .cell-handler {
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .cell-callers { text-align: right; }
    .handler-name { color: var(--ink-secondary); }
    .caller-count { color: var(--ink-secondary); }
    .text-muted { color: var(--ink-muted); }

    .col-reqid { width: 80px; }
    .col-cat { width: 200px; }
    .col-handler { width: 180px; }
    .col-callers { width: 64px; text-align: right; }

    /* ── Badge ── */
    .badge {
      display: inline-block;
      padding: 1px var(--sp-2);
      border-radius: var(--radius-sm);
      font-size: 0.6875rem;
      font-weight: 500;
      letter-spacing: 0.01em;
    }
    .badge[data-category="clinical-event"] { background: var(--cat-clinical-event-bg); color: var(--cat-clinical-event-fg); }
    .badge[data-category="orders"] { background: var(--cat-orders-bg); color: var(--cat-orders-fg); }
    .badge[data-category="messaging"] { background: var(--cat-messaging-bg); color: var(--cat-messaging-fg); }
    .badge[data-category="code-values"] { background: var(--cat-code-values-bg); color: var(--cat-code-values-fg); }
    .badge[data-category="encounter"] { background: var(--cat-encounter-bg); color: var(--cat-encounter-fg); }
    .badge[data-category="web-services"] { background: var(--cat-web-services-bg); color: var(--cat-web-services-fg); }
    .badge[data-category="pharmacy"] { background: var(--cat-pharmacy-bg); color: var(--cat-pharmacy-fg); }
    .badge[data-category="configuration"] { background: var(--cat-configuration-bg); color: var(--cat-configuration-fg); }
    .badge[data-category="eks"] { background: var(--cat-eks-bg); color: var(--cat-eks-fg); }
    .badge[data-category="radiology"] { background: var(--cat-radiology-bg); color: var(--cat-radiology-fg); }
    .badge[data-category="materials"] { background: var(--cat-materials-bg); color: var(--cat-materials-fg); }
    .badge[data-category="scheduling"] { background: var(--cat-scheduling-bg); color: var(--cat-scheduling-fg); }
    .badge[data-category="personnel"] { background: var(--cat-personnel-bg); color: var(--cat-personnel-fg); }
    .badge[data-category="printing"] { background: var(--cat-printing-bg); color: var(--cat-printing-fg); }
    .badge[data-category="patient-accounting"] { background: var(--cat-patient-accounting-bg); color: var(--cat-patient-accounting-fg); }
    .badge[data-category="education"] { background: var(--cat-education-bg); color: var(--cat-education-fg); }
    .badge[data-category="surgery"] { background: var(--cat-surgery-bg); color: var(--cat-surgery-fg); }
    .badge[data-category="other"] { background: var(--cat-other-bg); color: var(--cat-other-fg); }

    /* ── Tags ── */
    .cell-tags { display: flex; flex-wrap: wrap; gap: var(--sp-1); }
    .tag {
      padding: 0 var(--sp-2);
      border-radius: var(--radius-sm);
      background: var(--surface-1);
      border: 1px solid var(--border-soft);
      color: var(--ink-tertiary);
      font-family: var(--font-mono);
      font-size: 0.625rem;
    }

    /* ── Pagination ── */
    .pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--sp-4) 0;
      margin-top: var(--sp-2);
      border-top: 1px solid var(--border-soft);
    }
    .page-controls {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
    }
    .page-btn {
      padding: var(--sp-1) var(--sp-3);
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      background: transparent;
      color: var(--ink-tertiary);
      cursor: pointer;
      font-family: var(--font-body);
      font-size: 0.6875rem;
      font-weight: 500;
      transition: all 0.12s;
    }
    .page-btn:hover:not(:disabled) {
      border-color: var(--border-emphasis);
      color: var(--ink-secondary);
    }
    .page-btn:disabled { opacity: 0.25; cursor: default; }
    .page-info {
      font-family: var(--font-mono);
      font-size: 0.6875rem;
      color: var(--ink-tertiary);
      min-width: 48px;
      text-align: center;
    }
    .page-size { display: flex; align-items: center; gap: var(--sp-2); }
    .page-size-select {
      padding: var(--sp-1) var(--sp-2);
      background: var(--control-bg);
      border: 1px solid var(--control-border);
      border-radius: var(--radius-md);
      color: var(--ink-secondary);
      font-family: var(--font-mono);
      font-size: 0.6875rem;
    }
    .page-size-label {
      font-size: 0.6875rem;
      color: var(--ink-muted);
    }

    .empty-state {
      text-align: center;
      padding: var(--sp-12);
      color: var(--ink-muted);
      font-size: 0.8125rem;
    }
  `]
})
export class RequestListComponent implements OnInit, OnDestroy {
  allRequests: TdbRequest[] = [];
  filteredRequests: TdbRequest[] = [];
  categories: Category[] = [];
  activeCategory: string | null = null;
  filterText = '';
  sortField: string = 'reqid';
  sortDir: 'asc' | 'desc' = 'asc';
  pageSize = 100;
  currentPage = 1;
  totalPages = 1;
  paginatedRequests: TdbRequest[] = [];
  private subs: Subscription[] = [];

  constructor(private dataService: TdbDataService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.subs.push(
      this.dataService.getDatabase().subscribe(db => {
        this.allRequests = db.requests;
        this.categories = db.categories;

        this.route.queryParams.subscribe(params => {
          if (params['q']) {
            this.filterText = params['q'];
          }
          if (params['category']) {
            this.activeCategory = params['category'];
          }
          this.applyFilters();
        });
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  filterByCategory(categoryId: string | null): void {
    this.activeCategory = categoryId;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.allRequests;
    if (this.activeCategory) {
      filtered = filtered.filter(r => r.category_id === this.activeCategory);
    }
    if (this.filterText.trim()) {
      const lower = this.filterText.toLowerCase();
      filtered = filtered.filter(r =>
        String(r.reqid).includes(lower) ||
        r.name.toLowerCase().includes(lower) ||
        r.description.toLowerCase().includes(lower) ||
        r.category_id.includes(lower) ||
        r.tags.some(t => t.includes(lower)) ||
        r.usages.some(u => u.program_name.includes(lower))
      );
    }
    this.sortRequests(filtered);
  }

  sort(field: string): void {
    if (this.sortField === field) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDir = 'asc';
    }
    this.sortRequests(this.filteredRequests);
  }

  getSortIcon(field: string): string {
    if (this.sortField !== field) return '';
    return this.sortDir === 'asc' ? '\u25B2' : '\u25BC';
  }

  private sortRequests(requests: TdbRequest[]): void {
    const dir = this.sortDir === 'asc' ? 1 : -1;
    this.filteredRequests = [...requests].sort((a, b) => {
      let aVal: any, bVal: any;
      switch (this.sortField) {
        case 'usages': aVal = a.usages.length; bVal = b.usages.length; break;
        case 'category_id': aVal = a.category_id; bVal = b.category_id; break;
        default: aVal = (a as any)[this.sortField]; bVal = (b as any)[this.sortField]; break;
      }
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (aVal < bVal) return -1 * dir;
      if (aVal > bVal) return 1 * dir;
      return 0;
    });
    this.currentPage = 1;
    this.paginate();
  }

  private paginate(): void {
    this.totalPages = Math.max(1, Math.ceil(this.filteredRequests.length / this.pageSize));
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedRequests = this.filteredRequests.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.paginate();
  }

  onPageSizeChange(): void {
    this.pageSize = Number(this.pageSize);
    this.currentPage = 1;
    this.paginate();
  }

  getCategoryName(id: string): string {
    return this.categories.find(c => c.id === id)?.name || id;
  }

  getCategoryCount(id: string): number {
    return this.allRequests.filter(r => r.category_id === id).length;
  }
}
