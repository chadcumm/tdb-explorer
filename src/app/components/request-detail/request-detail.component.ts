import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, switchMap } from 'rxjs';
import { TdbDataService } from '../../services/tdb-data.service';
import { TdbRequest } from '../../models/tdb-request.model';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (request) {
    <div class="container">
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
          @if (request.usages.length > 0) {
          <div class="flow-items">
            @for (u of uniqueCallers.slice(0, 6); track u) {
              <div class="flow-node flow-node-caller">
                <span class="flow-node-name">{{ u }}</span>
              </div>
            }
            @if (uniqueCallers.length > 6) {
              <div class="flow-overflow">+{{ uniqueCallers.length - 6 }} more</div>
            }
          </div>
          } @else {
          <div class="flow-items">
            <div class="flow-node flow-node-empty">No callers found</div>
          </div>
          }
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
          @if (request.handler) {
            <div class="flow-node flow-node-handler">
              <span class="flow-node-name">{{ request.handler.program_name }}</span>
              @if (request.handler.purpose) {
                <span class="flow-node-meta">{{ request.handler.purpose }}</span>
              }
            </div>
          } @else {
            <div class="flow-node flow-node-empty">No handler registered</div>
          }
        </div>
      </div>

      <!-- ═══ Description ═══ -->
      @if (request.description) {
        <p class="description">{{ request.description }}</p>
      }

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
        @if (request.tags.length > 0) {
          <div class="meta-item">
            <span class="meta-label">Tags</span>
            <span class="meta-value tags-inline">
              @for (tag of request.tags; track tag) {
                <span class="tag">{{ tag }}</span>
              }
            </span>
          </div>
        }
      </div>

      <!-- ═══ Handler Detail ═══ -->
      @if (request.handler) {
        <div class="section">
          <h2 class="section-heading">Handler Script</h2>
          <div class="detail-card handler-card">
            <div class="detail-row">
              <span class="detail-label">Program</span>
              <span class="detail-value mono">{{ request.handler.program_name }}</span>
            </div>
            @if (request.handler.purpose) {
              <div class="detail-row">
                <span class="detail-label">Purpose</span>
                <span class="detail-value">{{ request.handler.purpose }}</span>
              </div>
            }
            <div class="detail-row">
              <span class="detail-label">File</span>
              <span class="detail-value mono">{{ request.handler.file }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Repository</span>
              <span class="detail-value">{{ request.handler.repository }}</span>
            </div>
            @if (request.handler.product) {
              <div class="detail-row">
                <span class="detail-label">Product</span>
                <span class="detail-value">{{ request.handler.product }}</span>
              </div>
            }
            @if (request.handler.product_team) {
              <div class="detail-row">
                <span class="detail-label">Team</span>
                <span class="detail-value">{{ request.handler.product_team }}</span>
              </div>
            }
            @if (request.handler.task_id) {
              <div class="detail-row">
                <span class="detail-label">Task ID</span>
                <span class="detail-value mono">{{ request.handler.task_id }}</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- ═══ Record Structures ═══ -->
      @if (request.request_record) {
        <div class="section">
          <h2 class="section-heading collapsible" (click)="showRequestRecord = !showRequestRecord">
            <svg [class.rotated]="showRequestRecord" class="chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
            Request Record
            <span class="record-name">{{ request.request_record.name }}</span>
          </h2>
          @if (showRequestRecord) {
            <pre class="record-block">@for (f of request.request_record.fields; track f.name) {<span class="field-name">{{ f.name }}</span> <span class="field-sep">=</span> <span class="field-type">{{ f.type }}</span>
}</pre>
          }
        </div>
      }

      @if (request.reply_record) {
        <div class="section">
          <h2 class="section-heading collapsible" (click)="showReplyRecord = !showReplyRecord">
            <svg [class.rotated]="showReplyRecord" class="chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
            Reply Record
            <span class="record-name">{{ request.reply_record.name }}</span>
          </h2>
          @if (showReplyRecord) {
            <pre class="record-block">@for (f of request.reply_record.fields; track f.name) {<span class="field-name">{{ f.name }}</span> <span class="field-sep">=</span> <span class="field-type">{{ f.type }}</span>
}</pre>
          }
        </div>
      }

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
              @for (u of request.usages; track $index) {
              <tr>
                <td class="mono accent">{{ u.program_name }}</td>
                <td class="mono">{{ u.file }}</td>
                <td class="mono">{{ u.line }}</td>
                <td class="mono text-muted">{{ u.subroutine || '\u2014' }}</td>
                <td>{{ u.repository }}</td>
              </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- ═══ Related ═══ -->
      @if (request.related_reqids.length > 0) {
        <div class="section">
          <h2 class="section-heading">Related Requests</h2>
          <div class="related-grid">
            @for (rid of request.related_reqids; track rid) {
              <a [routerLink]="['/request', rid]" class="related-link">{{ rid }}</a>
            }
          </div>
        </div>
      }
    </div>
    }

    @if (!request && loaded) {
      <div class="container">
        <div class="empty-state">Request not found.</div>
      </div>
    }
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

    .data-table td { font-size: 0.75rem; }
    .accent { color: var(--accent); }

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

  `]
})
export class RequestDetailComponent implements OnInit, OnDestroy {
  request: TdbRequest | null = null;
  loaded = false;
  showRequestRecord = false;
  showReplyRecord = false;
  uniqueCallers: string[] = [];
  private subs: Subscription[] = [];

  constructor(private route: ActivatedRoute, private dataService: TdbDataService) {}

  ngOnInit(): void {
    this.subs.push(
      this.route.params.pipe(
        switchMap(params => this.dataService.getRequestById(Number(params['reqid'])))
      ).subscribe(req => {
        this.request = req || null;
        this.loaded = true;
        if (req) {
          this.uniqueCallers = [...new Set(req.usages.map(u => u.program_name))];
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  getCategoryName(id: string): string {
    return this.dataService.getCategoryName(id);
  }
}
