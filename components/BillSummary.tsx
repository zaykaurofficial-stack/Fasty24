import { BookingPricing } from '@/lib/api';

/**
 * The one place the customer-facing money breakdown is laid out. Tax is shown
 * as a single combined line — the CGST/SGST split only appears on the invoice.
 */
export default function BillSummary({
  pricing,
  itemLabel = 'Item total',
  platformFeeLabel = 'Platform fee',
  dark = false,
}: {
  pricing: BookingPricing;
  itemLabel?: string;
  platformFeeLabel?: string;
  dark?: boolean;
}) {
  const fee = pricing.platformFee ?? 0;
  const taxes = (pricing.tax ?? 0) + (pricing.platformFeeTax ?? 0);
  const muted = dark ? 'text-gray-400' : 'text-fasty-gray';
  const strong = dark ? 'text-white' : '';
  const divider = dark ? 'border-white/8' : 'border-gray-100';

  return (
    <div className="space-y-2 text-sm">
      <Row label={itemLabel} value={pricing.subtotal} muted={muted} strong={strong} />
      {pricing.discount > 0 && (
        <Row label="Discount" value={-pricing.discount} muted={muted} strong={strong} />
      )}
      {fee > 0 && <Row label={platformFeeLabel} value={fee} muted={muted} strong={strong} />}
      {taxes > 0 && <Row label="Est. Govt. taxes" value={taxes} muted={muted} strong={strong} />}
      <div className={`flex justify-between text-base pt-2 border-t ${divider}`}>
        <span className={`font-bold ${strong}`}>Total bill</span>
        <span className={`font-extrabold ${dark ? 'text-fasty-yellow' : ''}`}>₹{pricing.total}</span>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  strong,
}: {
  label: string;
  value: number;
  muted: string;
  strong: string;
}) {
  return (
    <div className="flex justify-between">
      <span className={muted}>{label}</span>
      <span className={`font-semibold ${strong}`}>
        {value < 0 ? `-₹${Math.abs(value)}` : `₹${value}`}
      </span>
    </div>
  );
}
