import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NumberInputProps {
  label: string;
  validBid: number;
  onValidBid: (validBid: number) => void;
  placeholder?: string;
  className?: string;
}

function NumberInput({
  label,
  validBid,
  onValidBid,
  placeholder,
  className,
}: NumberInputProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "" || !isNaN(Number(value))) {
      setInputValue(value);
      if (value !== "" && Number(value) <= validBid) {
        setError(`The value must be greater than ${validBid}`);
      } else {
        setError("");
        onValidBid(Number(value));
      }
    }
  };

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      <Label
        htmlFor="number-input"
        className="text-lg font-medium text-gray-700"
      >
        {label}
      </Label>
      <Input
        id="number-input"
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="border p-2 rounded-md md:text-lg"
      />
      {error && <span className="text-red-500 text-md">{error}</span>}
    </div>
  );
}

export default NumberInput;
