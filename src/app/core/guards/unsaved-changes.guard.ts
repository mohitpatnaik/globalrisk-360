export interface CanDeactivateGuard {
  canDeactivate: () => boolean;
}

// CanDeactivate guard: warns user on unsaved changes in the claim submission wizard
export function unsavedChangesGuard(component: CanDeactivateGuard): boolean {
  if (component.canDeactivate && !component.canDeactivate()) {
    return false;
  }
  return true;
}
