window.addEventListener('error', function (e) {
  (window.__errs = window.__errs || []).push(String(e.message) + ' @ ' + (e.filename || '') + ':' + (e.lineno || ''));
  console.error('[JS ERROR]', e.message, e.filename, e.lineno);
});
window.addEventListener('unhandledrejection', function (e) {
  (window.__errs = window.__errs || []).push('REJECT: ' + String(e.reason && (e.reason.stack || e.reason.message || e.reason)));
  console.error('[PROMISE]', e.reason);
});
