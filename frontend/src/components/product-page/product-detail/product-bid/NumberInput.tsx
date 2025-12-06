import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NumberInputProps {
  validBid: number;
  onValidBid: (validBid: number) => void;
}

function NumberInput({ validBid, onValidBid }: NumberInputProps) {
  const [inputValue, setInputValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "" || !isNaN(Number(value))) {
      setInputValue(value);
      if (value !== "" && Number(value) < validBid) {
        setError(`The value must be greater than or equal to ${validBid}`);
      } else {
        setError("");
        onValidBid(Number(value));
      }
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <Label
        htmlFor="number-input"
        className="text-lg font-medium text-gray-700"
      >
        Enter a bid (must be &gt;= {validBid}):
      </Label>
      <Input
        id="number-input"
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={`e.g., ${validBid} or ${validBid + 1}`}
        className="border p-2 rounded-md md:text-lg"
      />
      {error && <span className="text-red-500 text-md">{error}</span>}
    </div>
  );
}

export default NumberInput;
