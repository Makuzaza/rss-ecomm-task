export interface BuildPaths {
  entry: string;
  html: string;
  public: string;
  output: string;
  src: string;
}

export type BuildMode = "production" | "development";
export type BuildPlatform = "mobile" | "desktop";

export interface BuildOptions {
  port: number;
  mode: BuildMode;
  paths: BuildPaths;
  // platform: BuildPlatform;
  analyzer?: boolean;
}
