export const commandBlock = (payload: {
  lang?: string;
  content: string[];
  platform: "windows" | "linux";
}): string => {
  const LINE_BRAKER = {
    windows: " ^\n",
    linux: " \\\n",
  } as const;
  const platformContent = payload.content.join(LINE_BRAKER[payload.platform]);
  // .replaceAll('-', '\\\\-');

  return "```" + (payload.lang ?? "") + "\n" + platformContent + "```";
};
