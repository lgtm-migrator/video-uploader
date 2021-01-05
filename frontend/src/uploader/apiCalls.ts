export type APIError = { ok: false; error: string };
export type APIOK = { ok: true };

export const isAPIError = (possible: APIError | APIOK): possible is APIError => possible.ok === false;

export interface Part {
  ETag: string;
  PartNumber: number;
}

export const apiCall = async <T>(remoteURL: string, body: unknown, token?: string): Promise<T> => {
  const response = await fetch(`${process.env.AWS_UPLOAD_API_SERVER}${remoteURL}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      ...(token !== undefined && { authorization: 'Bearer ' + token }),
    },
  });

  return response.json() as Promise<T>;
};

export type UploadIdResponse = APIError | (APIOK & { token: string });
export const getUploadId = async (
  token: string,
  fileName: string,
  presentationTitle: string,
): Promise<UploadIdResponse> => apiCall('/begin', { fileName, presentationTitle }, token);

export type GetPartURLResponse = APIError | (APIOK & { signedURLs: string[] });
export const getPartURL = (token: string, part: number): Promise<GetPartURLResponse> =>
  apiCall('/sign', { parts: 1, start: part }, token);

export type AbandonUploadResponse = APIError | APIOK;
export const abandonUpload = async (token: string): Promise<APIError | APIOK> => apiCall('/abandon', {}, token);

export type CompleteUploadResponse = APIError | APIOK;
export const completeUpload = async (token: string, parts: Part[]): Promise<CompleteUploadResponse> =>
  apiCall('/finish', { parts }, token);

export type PortalDetails =
  | APIError
  | (APIOK & {
      ok: boolean;
      name: string;
      token: string;
    });

export const getPortalDetails = async (presenterId: string): Promise<PortalDetails> =>
  apiCall(`/presenter/${encodeURIComponent(presenterId)}`, {});
