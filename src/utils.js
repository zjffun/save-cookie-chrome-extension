export function genId() {
  return Math.random().toString(36).substring(2);
}

export async function getCurrentTab() {
  const queryOptions = { active: true, currentWindow: true };

  const tabs = await chrome?.tabs?.query(queryOptions);

  const tab = tabs?.[0];

  return tab;
}

export async function getCookies(cookieNames) {
  const result = {};
  const currentTab = await getCurrentTab();

  if (!currentTab) {
    return result;
  }

  const currentUrl = currentTab.url;

  for (const name of cookieNames) {
    const value = await chrome?.cookies?.get({
      name,
      url: currentUrl,
    });

    result[name] = value;
  }

  return result;
}

export function getOneLevelDomain(url) {
  const oneLevelDomain = new URL(url).hostname.split(".").slice(-2).join(".");

  return oneLevelDomain;
}

export async function setCookie({ name, value }) {
  const currentTab = await getCurrentTab();
  if (!currentTab) {
    return false;
  }

  const currentUrl = currentTab.url;

  const cookies = await getCookies([name]);
  const originalCookie = cookies[name];

  const oneLevelDomain = getOneLevelDomain(currentUrl);

  const info = {
    name,
    value,
    domain: originalCookie?.domain || oneLevelDomain,
    expirationDate: Number.MAX_SAFE_INTEGER,
    httpOnly: originalCookie?.httpOnly,
    path: originalCookie?.path || "/",
    sameSite: originalCookie?.sameSite,
    secure: originalCookie?.secure,
    storeId: originalCookie?.storeId,
    url: currentUrl,
  };

  const result = await chrome?.cookies?.set(info);

  return result;
}

export async function checkHasPermission() {
  try {
    const currentTab = await getCurrentTab();

    if (!currentTab) {
      return;
    }

    const currentUrl = currentTab.url;

    const result = await chrome.permissions.contains({
      origins: [`${new URL(currentUrl).origin}/*`],
    });

    return result;
  } catch {
    return false;
  }
}
