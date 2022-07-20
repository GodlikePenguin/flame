const hasProtocol = (url: string): boolean => /^\w+:\/\//.test(url);
const isSteamUrl = (url: string): boolean => /^steam:\/\//.test(url);
const isWebUrl = (url: string): boolean => /^https?:\/\//.test(url);

export const urlParser = (url: string): string[] => {
  if (!hasProtocol(url)) {
    // No protocol -> apply http:// prefix
    url = `http://${url}`;
  }

  url = performReplacements(url);

  // Create simplified url to display as text
  let displayUrl: string;
  if (isSteamUrl(url)) {
    displayUrl = 'Run Steam App';
  } else if (isWebUrl(url)) {
    displayUrl = url
      .replace(/https?:\/\//, '')
      .replace('www.', '')
      .replace(/\/$/, '');
  } else displayUrl = url;

  return [displayUrl, url];
};

/* eslint-disable no-restricted-globals */
const performReplacements = (url: string): string => {
  return url
    .replace('$host', location.host)
    .replace('$hostname', location.hostname)
    .replace('$port', location.port);
};
