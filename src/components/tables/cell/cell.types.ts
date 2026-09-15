import type { Field, TableWithRecordRows } from "../../../types/table.types";

export type CellBaseProps = {
  table: TableWithRecordRows;
  field: Field;

  rowId: string;
  initialValue: string;
  rowNumber: number;
  totalRows: number;
  hasPrevRow: boolean;
  hasNextRow: boolean;
  onPrevRow: () => void;
  onNextRow: () => void;

  fieldNumber: number;
  totalFields: number;
  hasPrevField: boolean;
  hasNextField: boolean;
  onPrevField: () => void;
  onNextField: () => void;
};
