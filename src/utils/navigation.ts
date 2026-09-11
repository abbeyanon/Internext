export const navigate = (url: string) => {
  if (!url.startsWith('/')) {
    url = '/' + url;
  }
  window.history.pushState({}, '', url);
  window.dispatchEvent(new CustomEvent('app:locationchange'));
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
