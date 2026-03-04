/**
 * IJB API Service
 * ──────────────────────────────────────────────────────────────────
 * Funções tipadas para o frontend Next.js consumir a API do backend.
 * Configure a variável de ambiente:
 *   NEXT_PUBLIC_API_URL=http://localhost:4000
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

export interface SubmissionForm {
  author_name: string;
  author_email: string;
  author_institution: string;
  author_bio: string;
  title: string;
  abstract: string;
  keywords: string[];
  area: 'education' | 'philosophy' | 'theology' | 'culture';
  cover_letter?: string;
  file: File;
}

export interface SubmissionResponse {
  protocol: string;
  submission_id: string;
}

export interface Edition {
  id: string;
  volume: number;
  number: number;
  year: number;
  status: 'Recebendo submissões' | 'Publicada' | 'Em revisão' | 'Encerrada';
  focus: string;
  deadline: string | null;
}

export interface ApiError {
  error: string;
  statusCode: number;
  details?: unknown;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      error: 'Erro desconhecido',
      statusCode: res.status,
    }));
    throw err;
  }
  return res.json() as Promise<T>;
}

// ─── Contact ───────────────────────────────────────────────────────────────

/**
 * Envia uma mensagem de contato para a API.
 *
 * No Contact.tsx, substitua o setTimeout simulado por:
 *   const result = await sendContact({ name, email, message });
 */
export async function sendContact(data: ContactForm): Promise<ContactResponse> {
  const res = await fetch(`${API_URL}/api/v1/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<ContactResponse>(res);
}

// ─── Submissions ───────────────────────────────────────────────────────────

/**
 * Submete um artigo para a revista RCBC.
 * O campo `file` é um objeto File do browser.
 */
export async function submitArticle(data: SubmissionForm): Promise<SubmissionResponse> {
  const formData = new FormData();
  formData.append('author_name', data.author_name);
  formData.append('author_email', data.author_email);
  formData.append('author_institution', data.author_institution);
  formData.append('author_bio', data.author_bio);
  formData.append('title', data.title);
  formData.append('abstract', data.abstract);
  data.keywords.forEach((kw) => formData.append('keywords', kw));
  formData.append('area', data.area);
  if (data.cover_letter) formData.append('cover_letter', data.cover_letter);
  formData.append('file', data.file);

  const res = await fetch(`${API_URL}/api/v1/submissions`, {
    method: 'POST',
    body: formData,
    // Note: do NOT set Content-Type header — browser sets it with boundary
  });

  return handleResponse<SubmissionResponse>(res);
}

// ─── Editions ──────────────────────────────────────────────────────────────

/**
 * Retorna a edição atual da revista RCBC.
 *
 * No Journal.tsx, substitua os valores hard-coded por:
 *   const edition = await getCurrentEdition();
 *
 * Em caso de falha da API, use os valores estáticos de fallback.
 */
export async function getCurrentEdition(): Promise<Edition> {
  const res = await fetch(`${API_URL}/api/v1/editions/current`, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(({ next: { revalidate: 300 } }) as any), // Next.js 14 ISR cache hint
  } as RequestInit);
  return handleResponse<Edition>(res);
}

/**
 * Lista todas as edições publicadas.
 */
export async function listEditions(): Promise<Edition[]> {
  const res = await fetch(`${API_URL}/api/v1/editions`, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...(({ next: { revalidate: 300 } }) as any),
  } as RequestInit);
  return handleResponse<Edition[]>(res);
}

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export async function login(email: string, password: string): Promise<AuthTokens> {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AuthTokens>(res);
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<{ access_token: string }> {
  const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  return handleResponse<{ access_token: string }>(res);
}
