import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, ReactiveFormsModule, ValidationErrors, Validators, FormBuilder } from '@angular/forms';
import { PolicyStore } from '../../core/stores/policy.store';
import { ClaimStore } from '../../core/stores/claim.store';
import { ActivityStore } from '../../core/stores/activity.store';
import { ReferenceDataStore } from '../../core/stores/reference-data.store';
import { GrCardComponent } from '../../shared/ui/gr-card/gr-card.component';
import { GrButtonComponent } from '../../shared/ui/gr-button/gr-button.component';
import { Router } from '@angular/router';
import { ClaimStateMachine } from '../../core/claims/claim-state-machine';
import { RoleService } from '../../core/services/role.service';
import type { LocalPolicy } from '../../core/models/policy.model';
import type { ActivityType } from '../../core/models/activity.model';
import type { Claim } from '../../core/models/claim.model';

interface CanDeactivateGuard {
  canDeactivate: () => boolean;
}

@Component({ selector: 'app-claim-submission', imports: [ReactiveFormsModule, GrCardComponent, GrButtonComponent], templateUrl: './claim-submission.component.html', styleUrl: './claim-submission.component.scss', changeDetection: ChangeDetectionStrategy.OnPush })
export class ClaimSubmissionComponent implements CanDeactivateGuard {
  private readonly formBuilder = inject(FormBuilder); private readonly policyStore = inject(PolicyStore); private readonly claimStore = inject(ClaimStore); private readonly activityStore = inject(ActivityStore); private readonly references = inject(ReferenceDataStore); private readonly router = inject(Router); private readonly roleService = inject(RoleService);
  readonly step = signal(1); readonly submitted = signal(false); readonly countries = this.references.countries; readonly policies = computed(() => this.policyStore.policies().filter((policy) => policy.kind === 'LOCAL' && policy.status === 'ACTIVE'));
  readonly steps = ['Policy & country', 'Loss details', 'Line item', 'Priority', 'Review'];
  readonly form = this.formBuilder.nonNullable.group({ localPolicyId: ['', Validators.required], countryId: ['', Validators.required], title: ['', [Validators.required, Validators.minLength(4)]], description: ['', [Validators.required, Validators.minLength(12)]], lossDate: ['', [Validators.required, this.notFuture]], reportedDate: ['', Validators.required], riskCategory: ['PROPERTY', Validators.required], lineDescription: ['', Validators.required], amount: [0, [Validators.required, Validators.min(1)]], currency: ['EUR', Validators.required], priority: ['MEDIUM', Validators.required], assignedTo: [''] }, { validators: this.dateOrder });
  readonly claimedAmount = toSignal(this.form.controls.amount.valueChanges, { initialValue: 0 });
  selectPolicy(event: Event): void { const id = (event.target as HTMLSelectElement).value; this.form.controls.localPolicyId.setValue(id); const policy = this.policies().find((item) => item.id === id); if (policy?.kind === 'LOCAL') { this.form.controls.countryId.setValue(policy.countryId); this.form.controls.currency.setValue(policy.localCurrency); } }
  next(): void { if (!this.currentStepValid()) { this.form.markAllAsTouched(); return; } this.step.update((value) => Math.min(5, value + 1)); }
  back(): void { this.step.update((value) => Math.max(1, value - 1)); }
  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    const role = this.roleService.role();
    const localPolicy = this.policies().find((p) => p.kind === 'LOCAL' && p.id === value.localPolicyId) as LocalPolicy | undefined;
    if (!localPolicy) return;
    // Create claim entity
    const now = new Date().toISOString();
    const claimId = crypto.randomUUID();
    const claim = {
      id: claimId,
      claimNumber: `CLM-${new Date().getFullYear()}-${String(this.claimStore.claims().length + 1).padStart(4, '0')}`,
      status: 'DRAFT' as const,
      localPolicyId: value.localPolicyId,
      masterPolicyId: localPolicy.masterPolicyId,
      countryId: value.countryId,
      insuredId: localPolicy.insuredId,
      title: value.title,
      description: value.description,
      lossDate: value.lossDate,
      reportedDate: value.reportedDate,
      lineItems: [{
        id: crypto.randomUUID(),
        riskCategory: value.riskCategory as 'PROPERTY' | 'LIABILITY' | 'MARINE' | 'CYBER' | 'DIRECTORS_OFFICERS' | 'MOTOR_FLEET',
        description: value.lineDescription,
        claimedAmount: { amountMinor: value.amount * 100, currency: value.currency as 'EUR' | 'USD' | 'PLN' | 'GBP' }
      }],
      claimedTotal: { amountMinor: value.amount * 100, currency: value.currency as 'EUR' | 'USD' | 'PLN' | 'GBP' },
      priority: value.priority,
      assignedTo: value.assignedTo,
      createdAt: now,
      updatedAt: now
    };
    // Push to store (type-safe Claim)
    this.claimStore.addClaim(claim as Claim);
    // Transition to SUBMITTED via state machine
    const nextState = ClaimStateMachine.nextStatus('DRAFT', 'SUBMIT', role);
    if (nextState) {
      this.claimStore.transitionClaim(claimId, 'SUBMIT', role);
    }
    // Append activity event
    this.activityStore.addEvent({
      id: crypto.randomUUID(),
      type: 'CLAIM_CREATED' as ActivityType,
      entity: { kind: 'CLAIM', id: claimId, ref: claim.claimNumber },
      summary: `Claim ${claim.claimNumber} created and submitted for ${this.references.countryName(value.countryId)}`,
      actorRole: role,
      actorName: this.roleService.userName(),
      countryId: value.countryId,
      createdAt: new Date().toISOString()
    });
    this.submitted.set(true);
    // Redirect after brief display
    setTimeout(() => this.router.navigate(['/claims']), 1500);
  }
  countryName(): string { return this.references.countryName(this.form.controls.countryId.value); }
  policyNumber(): string { return this.policies().find((policy) => policy.id === this.form.controls.localPolicyId.value)?.policyNumber ?? '—'; }
  // CanDeactivate: warn on unsaved changes
  canDeactivate(): boolean {
    if (this.form.dirty && !this.submitted()) {
      return confirm('You have unsaved changes. Discard them?');
    }
    return true;
  }
  private currentStepValid(): boolean { if (this.step() === 1) return this.form.controls.localPolicyId.valid && this.form.controls.countryId.valid; if (this.step() === 2) return this.form.controls.title.valid && this.form.controls.description.valid && this.form.controls.lossDate.valid && this.form.controls.reportedDate.valid && !this.form.hasError('dateOrder'); if (this.step() === 3) return this.form.controls.lineDescription.valid && this.form.controls.amount.valid; if (this.step() === 4) return this.form.controls.priority.valid; return this.form.valid; }
  private notFuture(control: AbstractControl): ValidationErrors | null { return control.value && String(control.value) > new Date().toISOString().slice(0, 10) ? { future: true } : null; }
  private dateOrder(control: AbstractControl): ValidationErrors | null { const loss = control.get('lossDate')?.value as string | undefined; const reported = control.get('reportedDate')?.value as string | undefined; return loss && reported && reported < loss ? { dateOrder: true } : null; }
}
