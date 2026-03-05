import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TdbDataService } from '../../services/tdb-data.service';
import { Category } from '../../models/tdb-request.model';

interface CategoryCard {
  category: Category;
  count: number;
}

@Component({
  selector: 'app-category-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>Categories</h1>
      </div>

      <div class="stats-row" *ngIf="stats">
        <div class="stat">
          <span class="stat-value">{{ stats.totalRequests | number }}</span>
          <span class="stat-label">Request IDs</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-value">{{ stats.totalHandlers | number }}</span>
          <span class="stat-label">Handlers</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-value">{{ stats.totalUsages | number }}</span>
          <span class="stat-label">tdbexecute Calls</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-value">{{ stats.categories | number }}</span>
          <span class="stat-label">Categories</span>
        </div>
      </div>

      <div class="grid">
        <a
          *ngFor="let card of cards"
          [routerLink]="['/']"
          [queryParams]="{ category: card.category.id }"
          class="card"
          [attr.data-category]="card.category.id">
          <div class="card-header">
            <span class="card-count">{{ card.count }}</span>
            <span class="card-indicator" [attr.data-category]="card.category.id"></span>
          </div>
          <div class="card-name">{{ card.category.name }}</div>
          <div class="card-desc">{{ card.category.description }}</div>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .container { padding: var(--sp-6); }
    .page-header { margin-bottom: var(--sp-5); }
    .page-header h1 {
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--ink-primary);
      letter-spacing: -0.01em;
    }

    /* ── Stats ── */
    .stats-row {
      display: flex;
      align-items: center;
      gap: var(--sp-6);
      margin-bottom: var(--sp-6);
      padding: var(--sp-4) var(--sp-6);
      background: var(--surface-1);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
    }
    .stat { display: flex; flex-direction: column; gap: var(--sp-1); }
    .stat-value {
      font-family: var(--font-mono);
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--accent);
      letter-spacing: -0.02em;
    }
    .stat-label {
      font-size: 0.6875rem;
      color: var(--ink-muted);
      letter-spacing: 0.02em;
    }
    .stat-divider {
      width: 1px;
      height: 28px;
      background: var(--border);
    }

    /* ── Grid ── */
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: var(--sp-3);
    }
    .card {
      display: block;
      padding: var(--sp-5);
      background: var(--surface-1);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      text-decoration: none;
      transition: all 0.12s;
    }
    .card:hover {
      border-color: var(--border-emphasis);
      background: var(--surface-2);
    }
    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--sp-2);
    }
    .card-count {
      font-family: var(--font-mono);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--ink-primary);
      letter-spacing: -0.02em;
    }
    .card-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    .card-indicator[data-category="clinical-event"] { background: var(--cat-clinical-event-fg); }
    .card-indicator[data-category="orders"] { background: var(--cat-orders-fg); }
    .card-indicator[data-category="messaging"] { background: var(--cat-messaging-fg); }
    .card-indicator[data-category="code-values"] { background: var(--cat-code-values-fg); }
    .card-indicator[data-category="encounter"] { background: var(--cat-encounter-fg); }
    .card-indicator[data-category="web-services"] { background: var(--cat-web-services-fg); }
    .card-indicator[data-category="pharmacy"] { background: var(--cat-pharmacy-fg); }
    .card-indicator[data-category="configuration"] { background: var(--cat-configuration-fg); }
    .card-indicator[data-category="eks"] { background: var(--cat-eks-fg); }
    .card-indicator[data-category="radiology"] { background: var(--cat-radiology-fg); }
    .card-indicator[data-category="materials"] { background: var(--cat-materials-fg); }
    .card-indicator[data-category="scheduling"] { background: var(--cat-scheduling-fg); }
    .card-indicator[data-category="personnel"] { background: var(--cat-personnel-fg); }
    .card-indicator[data-category="printing"] { background: var(--cat-printing-fg); }
    .card-indicator[data-category="patient-accounting"] { background: var(--cat-patient-accounting-fg); }
    .card-indicator[data-category="education"] { background: var(--cat-education-fg); }
    .card-indicator[data-category="surgery"] { background: var(--cat-surgery-fg); }
    .card-indicator[data-category="other"] { background: var(--cat-other-fg); }
    .card-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--ink-primary);
      margin-bottom: var(--sp-2);
    }
    .card-desc {
      font-size: 0.75rem;
      color: var(--ink-tertiary);
      line-height: 1.4;
    }
  `]
})
export class CategoryViewComponent implements OnInit {
  cards: CategoryCard[] = [];
  stats: { totalRequests: number; totalHandlers: number; totalUsages: number; categories: number } | null = null;

  constructor(private dataService: TdbDataService) {}

  ngOnInit(): void {
    this.dataService.getDatabase().subscribe(db => {
      this.stats = {
        totalRequests: db.total_unique_reqids,
        totalHandlers: db.total_handlers_found,
        totalUsages: db.total_requests_found,
        categories: db.categories.length,
      };
      this.cards = db.categories.map(cat => ({
        category: cat,
        count: db.requests.filter(r => r.category_id === cat.id).length,
      })).sort((a, b) => b.count - a.count);
    });
  }
}
