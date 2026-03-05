export interface RecordField {
  name: string;
  type: string;
}

export interface RecordStructure {
  name: string;
  fields: RecordField[];
}

export interface Usage {
  file: string;
  file_path: string;
  line: number;
  program_name: string;
  repository: string;
  subroutine: string | null;
}

export interface Handler {
  program_name: string;
  file: string;
  file_path: string;
  repository: string;
  task_id: number | null;
  purpose: string | null;
  product: string | null;
  product_team: string | null;
}

export interface TdbRequest {
  reqid: number;
  appid: number | null;
  taskid: number | null;
  name: string;
  description: string;
  category_id: string;
  handler: Handler | null;
  request_record: RecordStructure | null;
  reply_record: RecordStructure | null;
  usages: Usage[];
  related_reqids: number[];
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface TdbDatabase {
  generated: string;
  scan_paths: string[];
  total_requests_found: number;
  total_unique_reqids: number;
  total_handlers_found: number;
  categories: Category[];
  requests: TdbRequest[];
}
