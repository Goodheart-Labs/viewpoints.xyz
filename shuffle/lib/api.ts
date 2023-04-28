export type Poll = {
  id: number;
  polis_id: string;
  title: string;
  core_question: string;
  created_at: string;
};

export type Comment = {
  id: number;
  poll_id: string;
  session_id?: string;
  edited_from_id?: number;
  author_name?: string;
  author_avatar_url?: string;
  comment: string;
  created_at: string;
};

export type Valence = "agree" | "disagree" | "skip" | "itsComplicated";

export type Response = {
  id: number;
  comment_id: number;
  session_id: string;
  valence: Valence;
  created_at: string;
};
