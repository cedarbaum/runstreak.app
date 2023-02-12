export default async function getErrorMessageFromResponse(res: Response) {
  try {
    const jsonError = await res.json();
    return jsonError.error ?? res.statusText ?? "Unknown Error";
  } catch (e: any) {
    return res.statusText ?? "Unknown Error";
  }
}
