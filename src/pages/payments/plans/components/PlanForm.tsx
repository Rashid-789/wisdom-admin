import { Input, Select } from "../../../../app/shared";
import type { PlanUpsertInput } from "../../Types/payments.types";

export default function PlanForm({
  value,
  onChange,
}: {
  value: PlanUpsertInput;
  onChange: (next: PlanUpsertInput) => void;
}) {
  return (
    <div className="space-y-3">
      <Input
        label="Plan name"
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        placeholder="Standard Monthly"
      />

      <Input
        label="Description (optional)"
        value={value.description ?? ""}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
        placeholder="Full access to courses..."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input
          label="Price"
          value={String(value.price)}
          onChange={(e) => onChange({ ...value, price: Number(e.target.value) || 0 })}
          placeholder="999"
        />
        <Select
          label="Currency"
          value={value.currency}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e) => onChange({ ...value, currency: e.target.value as any })}
          options={[
            { label: "PKR", value: "PKR" },
            { label: "USD", value: "USD" },
            { label: "GBP", value: "GBP" },
          ]}
        />
        <Select
          label="Interval"
          value={value.interval}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e) => onChange({ ...value, interval: e.target.value as any })}
          options={[
            { label: "Monthly", value: "monthly" },
            { label: "Yearly", value: "yearly" },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select
          label="Status"
          value={value.status}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e) => onChange({ ...value, status: e.target.value as any })}
          options={[
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ]}
        />

        <Select
          label="Provider"
          value={value.provider}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onChange={(e) => onChange({ ...value, provider: e.target.value as any })}
          options={[
            { label: "Stripe", value: "stripe" },
            { label: "Manual", value: "manual" },
            { label: "Other", value: "other" },
          ]}
        />
      </div>

      <Input
        label="Provider Plan ID (optional)"
        value={value.providerPlanId ?? ""}
        onChange={(e) => onChange({ ...value, providerPlanId: e.target.value })}
        placeholder="price_123"
      />
    </div>
  );
}

