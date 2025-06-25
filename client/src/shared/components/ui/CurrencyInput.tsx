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
}

export function CurrencyInput({ 
  value, 
  onValueChange, 
  label = "Precio",
  placeholder = "0.00",
  isRequired = false,
  name,
  validate,
  min = 0,
  decimalScale = 2
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
      min={min}
      validate={validate ? (strValue: string) => {
        const numValue = parseFloat(strValue.replace(/[\$\.\,]/g, '').replace(',', '.')) || 0;
        return validate(numValue);
      } : undefined}
    />
  );
} 