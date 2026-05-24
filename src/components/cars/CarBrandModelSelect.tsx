/**
 * CarBrandModelSelect
 * Reusable cascading Brand → Model → Variant selector powered by the
 * in-memory useCarDatabase cache (single fetch, instant subsequent renders).
 */
import { useCarDatabase } from '@/hooks/useCarDatabase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Props {
  brandId:    string;
  modelId:    string;
  variantId?: string;
  onBrandChange:   (v: string) => void;
  onModelChange:   (v: string) => void;
  onVariantChange?: (v: string) => void;
  showVariant?: boolean;
  /** optional extra classes on each row */
  className?: string;
  /** label size override */
  labelClass?: string;
  required?: boolean;
}

export function CarBrandModelSelect({
  brandId, modelId, variantId = '',
  onBrandChange, onModelChange, onVariantChange,
  showVariant = true, className, labelClass, required,
}: Props) {
  const { brands, loading, modelsForBrand, variantsForModel } = useCarDatabase();
  const models   = modelsForBrand(brandId);
  const variants = variantsForModel(modelId);

  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', className)}>
        {[1,2,3].map(i => <Skeleton key={i} className="h-10 w-full bg-muted rounded-md" />)}
      </div>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4', className)}>
      {/* Brand */}
      <div className="space-y-1.5">
        <Label className={cn('text-sm font-normal', labelClass)}>
          Brand {required && <span className="text-destructive">*</span>}
        </Label>
        <Select value={brandId || 'all'} onValueChange={v => {
          onBrandChange(v === 'all' ? '' : v);
          onModelChange('');
          onVariantChange?.('');
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Select brand…" />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map(b => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Model */}
      <div className="space-y-1.5">
        <Label className={cn('text-sm font-normal', labelClass)}>Model</Label>
        <Select
          value={modelId || 'all'}
          disabled={!brandId}
          onValueChange={v => {
            onModelChange(v === 'all' ? '' : v);
            onVariantChange?.('');
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={brandId ? 'Select model…' : 'Select brand first'} />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            <SelectItem value="all">All Models</SelectItem>
            {models.map(m => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Variant */}
      {showVariant && (
        <div className="space-y-1.5">
          <Label className={cn('text-sm font-normal', labelClass)}>Variant</Label>
          <Select
            value={variantId || 'all'}
            disabled={!modelId}
            onValueChange={v => onVariantChange?.(v === 'all' ? '' : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={modelId ? 'Select variant…' : 'Select model first'} />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              <SelectItem value="all">All Variants</SelectItem>
              {variants.map(v => (
                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

export default CarBrandModelSelect;
