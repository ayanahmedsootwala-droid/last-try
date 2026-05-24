export function buildPageTitle(pageTitle: string, siteName: string) {
  const cleanPageTitle = pageTitle.trim();
  const cleanSiteName = siteName.trim();

  if (!cleanPageTitle || cleanPageTitle === cleanSiteName) {
    return cleanSiteName;
  }

  return `${cleanPageTitle} | ${cleanSiteName}`;
}
