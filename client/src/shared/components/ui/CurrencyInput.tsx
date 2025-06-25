import { Input } from "@heroui/input";
import { NumericFormat } from "react-number-format";

interface CurrencyInputProps {
  value?: number;
  onValueChange: (value: number | undefined) => void;
  label?: string;
  placeholder?: string;
  isRequired?: boolean;
  name?: string;
  validate?: (value: number) => string | null;
  min?: number;
  decimalScale?: number;
  labelPlacement?: "inside" | "outside" | "outside-left";
  isClearable?: boolean;
}

export function CurrencyInput({ 
  value, 
  onValueChange, 
  label,
  placeholder = "0.00",
  isRequired = false,
  name,
  validate,
  min = 0,
  decimalScale = 2,
  labelPlacement = "inside",
  isClearable = false
}: CurrencyInputProps) {
  return (
    <NumericFormat
      value={value}
      thousandSeparator="."
      decimalSeparator=","
      prefix="$ "
      decimalScale={decimalScale}
      fixedDecimalScale={false}
      allowNegative={false}
      customInput={Input}
      onValueChange={(values) => {
        onValueChange(values.floatValue); // Devuelve el número como float sin formato
      }}
      name={name}
      label={label}
      placeholder={placeholder}
      isRequired={isRequired}
      variant="bordered"
      labelPlacement={labelPlacement}
      isClearable={isClearable}
      {...(isClearable && { onClear: () => onValueChange(undefined) })}
      min={min}
      validate={validate ? () => {
        return validate(value || 0);
      } : undefined}
    />
  );
} 