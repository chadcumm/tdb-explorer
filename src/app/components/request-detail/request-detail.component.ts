import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TdbDataService } from '../../services/tdb-data.service';
import { TdbRequest, Category } from '../../models/tdb-request.model';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container" *ngIf="request">
      <a routerLink="/" class="back-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        Requests
      </a>

      <!-- ═══ Flow Diagram: The Signature ═══ -->
      <div class="flow-diagram">
        <div class="flow-column flow-callers">
          <div class="flow-label">Callers</div>
          <div class="flow-items" *ngIf="request.usages.length > 0">
            <div *ngFor="let u of uniqueCallers.slice(0, 6)" class="flow-node flow-node-caller">
              <span class="flow-node-name">{{ u }}</span>
            </div>
            <div *ngIf="uniqueCallers.length > 6" class="flow-overflow">
              +{{ uniqueCallers.length - 6 }} more
            </div>
          </div>
          <div class="flow-items" *ngIf="request.usages.length === 0">
            <div class="flow-node flow-node-empty">No callers found</div>
          </div>
        </div>

        <div class="flow-connector">
          <div class="flow-line"></div>
          <svg class="flow-arrow" width="8" height="12" viewBox="0 0 8 12">
            <path d="M0 0 L8 6 L0 12" fill="var(--accent-dim)" />
          </svg>
        </div>

        <div class="flow-column flow-center">
          <div class="flow-label">Request</div>
          <div class="flow-node flow-node-request">
            <span class="flow-reqid">{{ request.reqid }}</span>
            <span class="flow-reqname">{{ request.name }}</span>
            <span class="badge" [attr.data-category]="request.category_id">
              {{ getCategoryName(request.category_id) }}
            </span>
          </div>
        </div>

        <div class="flow-connector">
          <svg class="flow-arrow" width="8" height="12" viewBox="0 0 8 12">
            <path d="M0 0 L8 6 L0 12" fill="var(--accent-dim)" />
          </svg>
          <div class="flow-line"></div>
        </div>

        <div class="flow-column flow-handler">
          <div class="flow-label">Handler</div>
          <div *ngIf="request.handler" class="flow-node flow-node-handler">
            <span class="flow-node-name">{{ request.handler.program_name }}</span>
            <span class="flow-node-meta" *ngIf="request.handler.purpose">{{ request.handler.purpose }}</span>
          </div>
          <div *ngIf="!request.handler" class="flow-node flow-node-empty">No handler registered</div>
        </div>
      </div>

      <!-- ═══ Description ═══ -->
      <p class="description" *ngIf="request.description">{{ request.description }}</p>

      <!-- ═══ Meta ═══ -->
      <div class="meta-row">
        <div class="meta-item">
          <span class="meta-label">AppID</span>
          <span class="meta-value">{{ request.appid ?? '\u2014' }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">TaskID</span>
          <span class="meta-value">{{ request.taskid ?? '\u2014' }}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Callers</span>
          <span class="meta-value">{{ request.usages.length }}</span>
        </div>
        <div class="meta-item" *ngIf="request.tags.length > 0">
          <span class="meta-label">Tags</span>
          <span class="meta-value tags-inline">
            <span *ngFor="let tag of request.tags" class="tag">{{ tag }}</span>
          </span>
        </div>
      </div>

      <!-- ═══ Handler Detail ═══ -->
      <div class="section" *ngIf="request.handler">
        <h2 class="section-heading">Handler Script</h2>
        <div class="detail-card handler-card">
          <div class="detail-row">
            <span class="detail-label">Program</span>
            <span class="detail-value mono">{{ request.handler.program_name }}</span>
          </div>
          <div class="detail-row" *ngIf="request.handler.purpose">
            <span class="detail-label">Purpose</span>
            <span class="detail-value">{{ request.handler.purpose }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">File</span>
            <span class="detail-value mono">{{ request.handler.file }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Repository</span>
            <span class="detail-value">{{ request.handler.repository }}</span>
          </div>
          <div class="detail-row" *ngIf="request.handler.product">
            <span class="detail-label">Product</span>
            <span class="detail-value">{{ request.handler.product }}</span>
          </div>
          <div class="detail-row" *ngIf="request.handler.product_team">
            <span class="detail-label">Team</span>
            <span class="detail-value">{{ request.handler.product_team }}</span>
          </div>
          <div class="detail-row" *ngIf="request.handler.task_id">
            <span class="detail-label">Task ID</span>
            <span class="detail-value mono">{{ request.handler.task_id }}</span>
          </div>
        </div>
      </div>

      <!-- ═══ Record Structures ═══ -->
      <div class="section" *ngIf="request.request_record">
        <h2 class="section-heading collapsible" (click)="showRequestRecord = !showRequestRecord">
          <svg [class.rotated]="showRequestRecord" class="chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
          Request Record
          <span class="record-name">{{ request.request_record.name }}</span>
        </h2>
        <pre *ngIf="showRequestRecord" class="record-block"><ng-container *ngFor="let f of request.request_record.fields"><span class="field-name">{{ f.name }}</span> <span class="field-sep">=</span> <span class="field-type">{{ f.type }}</span>
</ng-container></pre>
      </div>

      <div class="section" *ngIf="request.reply_record">
        <h2 class="section-heading collapsible" (click)="showReplyRecord = !showReplyRecord">
          <svg [class.rotated]="showReplyRecord" class="chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
          Reply Record
          <span class="record-name">{{ request.reply_record.name }}</span>
        </h2>
        <pre *ngIf="showReplyRecord" class="record-block"><ng-container *ngFor="let f of request.reply_record.fields"><span class="field-name">{{ f.name }}</span> <span class="field-sep">=</span> <span class="field-type">{{ f.type }}</span>
</ng-container></pre>
      </div>

      <!-- ═══ Usages ═══ -->
      <div class="section">
        <h2 class="section-heading">Usage Locations <span class="section-count">{{ request.usages.length }}</span></h2>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Program</th>
                <th>File</th>
                <th>Line</th>
                <th>Subroutine</th>
                <th>Repository</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of request.usages">
                <td class="mono accent">{{ u.program_name }}</td>
                <td class="mono">{{ u.file }}</td>
                <td class="mono">{{ u.line }}</td>
                <td class="mono text-muted">{{ u.subroutine || '\u2014' }}</td>
                <td>{{ u.repository }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ═══ Related ═══ -->
      <div class="section" *ngIf="request.related_reqids.length > 0">
        <h2 class="section-heading">Related Requests</h2>
        <div class="related-grid">
          <a *ngFor="let rid of request.related_reqids" [routerLink]="['/request', rid]" class="related-link">{{ rid }}</a>
        </div>
      </div>
    </div>

    <div class="container" *ngIf="!request && loaded">
      <div class="empty-state">Request not found.</div>
    </div>
  `,
  styles: [`
    .container {
      padding: var(--sp-6);
      max-width: 1100px;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: var(--sp-1);
      color: var(--ink-tertiary);
      text-decoration: none;
      font-size: 0.8125rem;
      font-weight: 500;
      margin-bottom: var(--sp-5);
      transition: color 0.12s;
    }
    .back-link:hover { color: var(--accent); }

    /* ═══ Flow Diagram ═══ */
    .flow-diagram {
      display: flex;
      align-items: flex-start;
      gap: 0;
      margin-bottom: var(--sp-8);
      padding: var(--sp-6);
      background: var(--surface-1);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
    }
    .flow-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: var(--sp-2);
    }
    .flow-callers { max-width: 220px; }
    .flow-center {
      flex: 0 0 auto;
      min-width: 200px;
      align-items: center;
      text-align: center;
    }
    .flow-handler { max-width: 220px; }
    .flow-label {
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--ink-muted);
      margin-bottom: var(--sp-1);
    }
    .flow-items {
      display: flex;
      flex-direction: column;
      gap: var(--sp-1);
    }
    .flow-node {
      padding: var(--sp-2) var(--sp-3);
      border-radius: var(--radius-md);
      border: 1px solid var(--border);
      background: var(--surface-2);
      font-size: 0.75rem;
    }
    .flow-node-caller .flow-node-name,
    .flow-node-handler .flow-node-name {
      font-family: var(--font-mono);
      color: var(--ink-secondary);
      font-size: 0.6875rem;
    }
    .flow-node-request {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--sp-2);
      padding: var(--sp-4) var(--sp-5);
      border-color: var(--accent-dim);
      background: var(--accent-subtle);
    }
    .flow-reqid {
      font-family: var(--font-mono);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--accent);
      letter-spacing: -0.02em;
    }
    .flow-reqname {
      font-size: 0.75rem;
      color: var(--ink-secondary);
      line-height: 1.3;
    }
    .flow-node-meta {
      font-size: 0.6875rem;
      color: var(--ink-tertiary);
      margin-top: var(--sp-1);
    }
    .flow-node-empty {
      color: var(--ink-muted);
      font-style: italic;
      border-style: dashed;
    }
    .flow-overflow {
      font-size: 0.6875rem;
      color: var(--ink-muted);
      padding-left: var(--sp-3);
    }
    .flow-connector {
      display: flex;
      align-items: center;
      padding: var(--sp-10) var(--sp-1) 0;
      gap: 0;
    }
    .flow-line {
      width: 24px;
      height: 1px;
      background: var(--accent-dim);
    }
    .flow-arrow { flex-shrink: 0; }

    /* ═══ Badge (same as list) ═══ */
    .badge {
      display: inline-block;
      padding: 1px var(--sp-2);
      border-radius: var(--radius-sm);
      font-size: 0.6875rem;
      font-weight: 500;
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

    /* ═══ Description ═══ */
    .description {
      color: var(--ink-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
      margin-bottom: var(--sp-5);
    }

    /* ═══ Meta ═══ */
    .meta-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-6);
      margin-bottom: var(--sp-6);
      padding: var(--sp-4) var(--sp-5);
      background: var(--surface-1);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }
    .meta-item { display: flex; flex-direction: column; gap: var(--sp-1); }
    .meta-label {
      font-size: 0.625rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--ink-muted);
    }
    .meta-value {
      font-family: var(--font-mono);
      font-size: 0.875rem;
      color: var(--ink-primary);
    }
    .tags-inline { display: flex; flex-wrap: wrap; gap: var(--sp-1); }
    .tag {
      padding: 0 var(--sp-2);
      border-radius: var(--radius-sm);
      background: var(--surface-2);
      border: 1px solid var(--border-soft);
      color: var(--ink-tertiary);
      font-family: var(--font-mono);
      font-size: 0.625rem;
    }

    /* ═══ Sections ═══ */
    .section { margin-bottom: var(--sp-6); }
    .section-heading {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--ink-tertiary);
      margin-bottom: var(--sp-3);
      padding-bottom: var(--sp-2);
      border-bottom: 1px solid var(--border-soft);
      display: flex;
      align-items: center;
      gap: var(--sp-2);
    }
    .section-count {
      font-family: var(--font-mono);
      color: var(--ink-muted);
      font-weight: 400;
    }
    .collapsible { cursor: pointer; user-select: none; }
    .collapsible:hover { color: var(--accent); }
    .chevron { transition: transform 0.15s; flex-shrink: 0; }
    .chevron.rotated { transform: rotate(90deg); }
    .record-name {
      font-family: var(--font-mono);
      font-weight: 400;
      font-size: 0.6875rem;
      color: var(--ink-muted);
      text-transform: none;
      letter-spacing: normal;
    }

    /* ═══ Detail card ═══ */
    .detail-card {
      background: var(--surface-1);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: var(--sp-4);
    }
    .handler-card { border-left: 2px solid var(--accent-dim); }
    .detail-row {
      display: flex;
      gap: var(--sp-4);
      padding: var(--sp-1) 0;
    }
    .detail-label {
      min-width: 72px;
      flex-shrink: 0;
      color: var(--ink-muted);
      font-size: 0.75rem;
    }
    .detail-value {
      color: var(--ink-secondary);
      font-size: 0.75rem;
    }
    .mono { font-family: var(--font-mono); }

    /* ═══ Record block ═══ */
    .record-block {
      background: var(--control-bg);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: var(--sp-4);
      font-family: var(--font-mono);
      font-size: 0.75rem;
      line-height: 1.6;
      overflow-x: auto;
    }
    .field-name { color: var(--ink-primary); }
    .field-sep { color: var(--ink-muted); }
    .field-type { color: var(--accent); }

    /* ═══ Table ═══ */
    .table-wrapper { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th {
      text-align: left;
      padding: var(--sp-2) var(--sp-3);
      border-bottom: 1px solid var(--border-emphasis);
      color: var(--ink-tertiary);
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .data-table td {
      padding: var(--sp-2) var(--sp-3);
      border-bottom: 1px solid var(--border-soft);
      color: var(--ink-secondary);
      font-size: 0.75rem;
    }
    .accent { color: var(--accent); }
    .text-muted { color: var(--ink-muted); }

    /* ═══ Related ═══ */
    .related-grid { display: flex; flex-wrap: wrap; gap: var(--sp-2); }
    .related-link {
      display: inline-block;
      padding: var(--sp-1) var(--sp-3);
      background: var(--surface-1);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--accent);
      text-decoration: none;
      font-family: var(--font-mono);
      font-size: 0.75rem;
      transition: all 0.12s;
    }
    .related-link:hover {
      background: var(--accent-subtle);
      border-color: var(--accent-dim);
    }

    .empty-state {
      text-align: center;
      padding: var(--sp-12);
      color: var(--ink-muted);
    }
  `]
})
export class RequestDetailComponent implements OnInit {
  request: TdbRequest | null = null;
  categories: Category[] = [];
  loaded = false;
  showRequestRecord = false;
  showReplyRecord = false;
  uniqueCallers: string[] = [];

  constructor(private route: ActivatedRoute, private dataService: TdbDataService) {}

  ngOnInit(): void {
    this.dataService.getCategories().subscribe(cats => this.categories = cats);
    this.route.params.subscribe(params => {
      const reqid = Number(params['reqid']);
      this.dataService.getRequestById(reqid).subscribe(req => {
        this.request = req || null;
        this.loaded = true;
        if (req) {
          this.uniqueCallers = [...new Set(req.usages.map(u => u.program_name))];
        }
      });
    });
  }

  getCategoryName(id: string): string {
    return this.categories.find(c => c.id === id)?.name || id;
  }
}
