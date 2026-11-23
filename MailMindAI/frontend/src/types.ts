export interface Classification {
  categories: string[];
  primary_category: string;
  domain: "work" | "personal";
  importance: number;
  importance_level: "high" | "medium" | "low";
  confidence: number;
  response_state: string;
  projects: string[];
  is_duplicate: boolean;
}

export interface EmailSummary {
  id: number;
  gmail_id: string;
  thread_id: number;
  date: string;
  subject: string | null;
  from_addr: string | null;
  from_name: string | null;
  snippet: string | null;
  is_unread: boolean;
  is_from_me: boolean;
  has_attachments: boolean;
  gmail_url: string;
  relationship: string | null;
  classification: Classification | null;
  match?: string;
}

export interface ThreadSummary {
  id: number;
  gmail_thread_id: string;
  subject: string | null;
  first_date: string | null;
  last_date: string | null;
  message_count: number;
  participants: string[];
  status: string;
  status_reason: string | null;
  last_from_me: boolean;
  gmail_url: string;
  last_email?: EmailSummary | null;
}

export interface EmailDetail extends EmailSummary {
  to_addrs: string[];
  cc_addrs: string[];
  label_ids: string[];
  body_text: string | null;
  body_purged: boolean;
  attachments: { filename: string; mime_type: string; size: number }[];
  list_unsubscribe_present: boolean;
  reasons: string[];
  thread: ThreadSummary | null;
  actions?: { id: number; description: string; status: string; due_date: string | null }[];
}

export interface ActionItem {
  id: number;
  description: string;
  action_type: string;
  owner: string;
  due_date: string | null;
  status: string;
  source: string;
  confidence: number;
  evidence: string | null;
  email_id: number | null;
  thread_id: number | null;
  ai_analysis_id: number | null;
  email: { subject: string | null; from_addr: string | null; date: string; gmail_url: string } | null;
}

export interface Analysis {
  id: number;
  analysis_type: string;
  analysis_label: string;
  question: string | null;
  processing_method: string;
  processing_label: string;
  status: string;
  selection: Record<string, unknown>;
  context_preview: ContextPreview;
  confirmed_at: string | null;
  completed_at: string | null;
  created_at: string;
  model: string | null;
  result: AnalysisResult | null;
  error: string | null;
  sources: { gmail_id: string; email_id: number | null; role: string; item_index: number | null; gmail_url: string }[];
  claude_code_instructions: string | null;
  context_hash?: string;
}

export interface ContextPreview {
  destination: string;
  message_count: number;
  total_chars: number;
  truncated_messages: number;
  omitted_messages: number;
  fields_shared: string[];
  not_shared: string[];
  warnings: string[];
  messages: { gmail_id: string; email_id: number; date: string; from: string; subject: string; chars: number; truncated: boolean; body_preview: string }[];
}

export interface SourcedItem {
  text: string;
  source_message_ids: string[];
  [k: string]: unknown;
}

export interface AnalysisResult {
  analysis_type: string;
  summary: string;
  summary_source_message_ids: string[];
  decisions: SourcedItem[];
  actions: SourcedItem[];
  commitments: SourcedItem[];
  open_questions: SourcedItem[];
  contradictions: SourcedItem[];
  deadlines: SourcedItem[];
  insufficient_information: string[];
  confidence: string;
  validation_warnings: string[];
}
