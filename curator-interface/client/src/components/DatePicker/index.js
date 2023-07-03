import { DatePicker, DatePickerInput } from "@carbon/react";

export function DateMenu({ date, setDate }) {
  return (
    <DatePicker
      value={date ?? ""}
      datePickerType="single"
      dateFormat="d/m/Y"
      maxDate={new Date().toLocaleDateString("pt-BR", {
        timeZone: "America/Sao_Paulo",
      })}
      onChange={(e) => {
        if (e && e.length > 0) {
          setDate(
            new Date(e)
              .toLocaleDateString("pt-BR", {
                timeZone: "America/Sao_Paulo",
              })
              .split("/")
              .reverse()
              .join("-")
          );
        } else setDate(null);
      }}
    >
      <DatePickerInput
        id="datePickerInput"
        placeholder="dd/mm/yyyy"
        size="lg"
      />
    </DatePicker>
  );
}
