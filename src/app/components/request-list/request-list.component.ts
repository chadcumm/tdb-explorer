import { Component, OnInit, OnDestroy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TdbDataService } from '../../services/tdb-data.service';
import { TdbRequest, Category } from '../../models/tdb-request.model';

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [DecimalPipe, RouterLink, FormsModule],
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
          @for (cat of categories; track cat.id) {
            <button
              class="chip"
              [class.active]="activeCategory === cat.id"
              [attr.data-category]="cat.id"
              (click)="filterByCategory(cat.id)">
              {{ cat.name }}
              <span class="chip-count">{{ getCategoryCount(cat.id) }}</span>
            </button>
          }
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
            @for (req of paginatedRequests; track req.reqid) {
              <tr [routerLink]="['/request', req.reqid]" class="row-link">
                <td class="cell-mono cell-reqid">{{ req.reqid }}</td>
                <td class="cell-name">{{ req.name }}</td>
                <td>
                  <span class="badge" [attr.data-category]="req.category_id">
                    {{ getCategoryName(req.category_id) }}
                  </span>
                </td>
                <td class="cell-mono cell-handler">
                  @if (req.handler) {
                    <span class="handler-name">{{ req.handler.program_name }}</span>
                  } @else {
                    <span class="text-muted">&mdash;</span>
                  }
                </td>
                <td class="cell-mono cell-callers">
                  @if (req.usages.length > 0) {
                    <span class="caller-count">{{ req.usages.length }}</span>
                  } @else {
                    <span class="text-muted">0</span>
                  }
                </td>
                <td class="cell-tags">
                  @for (tag of req.tags.slice(0, 3); track tag) {
                    <span class="tag">{{ tag }}</span>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (totalPages > 1) {
      <div class="pagination">
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
      }

      @if (filteredRequests.length === 0) {
      <div class="empty-state">
        No requests match your filters.
      </div>
      }
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
    .row-link {
      cursor: pointer;
      transition: background 0.08s;
    }
    .row-link:hover td { background: var(--surface-1); }

    .cell-mono { font-family: var(--font-mono); font-size: 0.75rem; }
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

    .col-reqid { width: 80px; }
    .col-cat { width: 200px; }
    .col-handler { width: 180px; }
    .col-callers { width: 64px; text-align: right; }

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
  categoryCountMap = new Map<string, number>();
  private subs: Subscription[] = [];

  constructor(private dataService: TdbDataService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.subs.push(
      this.dataService.getDatabase().subscribe(db => {
        this.allRequests = db.requests;
        this.categories = db.categories;

        this.categoryCountMap.clear();
        for (const req of db.requests) {
          this.categoryCountMap.set(req.category_id, (this.categoryCountMap.get(req.category_id) ?? 0) + 1);
        }

        this.applyFilters();
      })
    );
    this.subs.push(
      this.route.queryParams.subscribe(params => {
        if (params['q']) {
          this.filterText = params['q'];
        }
        if (params['category']) {
          this.activeCategory = params['category'];
        }
        if (this.allRequests.length > 0) {
          this.applyFilters();
        }
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
        r.category_id.toLowerCase().includes(lower) ||
        r.tags.some(t => t.toLowerCase().includes(lower)) ||
        r.usages.some(u => u.program_name.toLowerCase().includes(lower))
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
    return this.dataService.getCategoryName(id);
  }

  getCategoryCount(id: string): number {
    return this.categoryCountMap.get(id) ?? 0;
  }
}
