import React from "react";
import { Drawer, Card, CardContent, Button } from "../../../../app/shared";
import type { Plan, PlanUpsertInput } from "../../Types/payments.types";
import { createPlan, updatePlan } from "../../Api/payments.api";
import PlanForm from "./PlanForm";

function toForm(p: Plan | null): PlanUpsertInput {
  return {
    name: p?.name ?? "",
    description: p?.description ?? "",
    price: p?.price ?? 0,
    currency: p?.currency ?? "PKR",
    interval: p?.interval ?? "monthly",
    status: p?.status ?? "active",
    provider: p?.provider ?? "stripe",
    providerPlanId: p?.providerPlanId ?? "",
  };
}

export default function PlanFormDrawer({
  open,
  plan,
  onClose,
  onSaved,
}: {
  open: boolean;
  plan: Plan | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!plan;

  const [value, setValue] = React.useState<PlanUpsertInput>(() => toForm(plan));
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setValue(toForm(plan));
  }, [open, plan]);

  const canSave = value.name.trim().length > 2 && value.price >= 0;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Plan" : "Create Plan"}
      description="Create or update subscription plan details."
    >
      <Card>
        <CardContent className="p-4 space-y-4">
          <PlanForm value={value} onChange={setValue} />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              disabled={!canSave}
              isLoading={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  if (isEdit) await updatePlan(plan!.id, value);
                  else await createPlan(value);
                  onSaved();
                } finally {
                  setSaving(false);
                }
              }}
            >
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </Drawer>
  );
}

