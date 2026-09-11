// Default provider: logs the email instead of sending it. Swap EMAIL_PROVIDER
// to a real provider module once credentials are available (Resend/SMTP/etc.)
// — nothing else in the app needs to change, callers only see sendEmail().
export async function send({ to, subject, html, text }) {
  const links = [...(html?.matchAll(/href="([^"]+)"/g) || [])].map((m) => m[1]);

  console.log('\n[email:console] ------------------------------------------');
  console.log(`[email:console] To: ${to}`);
  console.log(`[email:console] Subject: ${subject}`);
  console.log(`[email:console] ${text || html?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500)}`);
  if (links.length) {
    console.log(`[email:console] Link(s): ${links.join(', ')}`);
  }
  console.log('[email:console] ------------------------------------------\n');
  return { success: true, provider: 'console' };
}
