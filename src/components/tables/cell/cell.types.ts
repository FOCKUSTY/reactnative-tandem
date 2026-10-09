import type {
  Field,
  FieldType,
  TableWithRecordRows,
} from "../../../types/table.types";

export type CellBaseProps = {
  table: TableWithRecordRows;
  field: Field;
  /** При наличии — CellEditor пишет в черновик вместо сервера. */
  draftTableId?: string;

  rowId: string;
  initialValue: string;
  /**
   * Тип, переопределённый для этой конкретной ячейки.
   * `null`/`undefined` — используется `field.type`.
   */
  initialCellType?: FieldType | null;

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
