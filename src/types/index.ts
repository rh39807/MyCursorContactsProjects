export interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  title: string;
  tags: string[];
}

export interface ContactTableProps {
  onEdit: (contact: Contact) => void;
  refreshTrigger: number;
}

export interface ContactFormProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  contact: Contact | null;
}

export interface Column {
  id: string;
  label: string;
  sortable: boolean;
  fixed?: boolean;
}

export interface Filters {
  email: string;
  company: string[];
  title: string[];
  tags: string[];
  firstName: string;
  lastName: string;
  phone: string;
  firstNameRegex: boolean;
  lastNameRegex: boolean;
  phoneRegex: boolean;
}

export type Order = 'asc' | 'desc';

export interface ColumnWidths {
  [key: string]: number;
}

export interface TableHeaderCellProps {
  column: Column;
  orderBy: string;
  order: Order;
  onRequestSort: (columnId: string) => void;
  onStartResize: (e: React.MouseEvent, columnId: string) => void;
  isDragging?: boolean;
  style?: React.CSSProperties;
  'data-column'?: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}

export interface ActionButtonsProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}

export interface StyledTableCellProps {
  isFixed?: boolean;
  theme?: any;
}

export interface FilterButtonProps {
  active?: boolean;
  theme?: any;
} 