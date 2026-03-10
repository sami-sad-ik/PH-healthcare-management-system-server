export interface TerrSources {
  path: string;
  message: string;
}

export interface TerrResponse {
  statusCode?: number;
  success: boolean;
  message: string;
  errSources?: TerrSources[];
  stack?: string;
  error?: unknown;
}
