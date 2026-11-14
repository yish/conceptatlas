import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  FileCode2,
  FileText,
  LogOut,
  Printer,
  Upload,
  X,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import { TRANSLATIONS, type Language } from '../i18n/translations';
import type { ConceptMapData } from '../types/conceptMap';
import {
  exportToJson,
  exportToMarkdown,
  exportToPdf,
  generateMarkdown,
  parseImportedContent,
} from '../utils/exportImport';
import {
  getAccessToken,
  getCurrentUser,
  googleSignIn,
  initAuth,
  logoutGoogle,
} from '../services/googleAuth';
import {
  exportMapToGoogleDoc,
  type GoogleDocExportResult,
} from '../services/googleDocsExport';

interface ImportExportModalProps {
  language: Language;
  open: boolean;
  initialTab?: 'export' | 'import';
  map: ConceptMapData;
  onClose: () => void;
  onImportMap: (imported: ConceptMapData) => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  language,
  open,
  initialTab = 'export',
  map,
  onClose,
  onImportMap,
}) => {
  const t = TRANSLATIONS[language].ioModal;
  const [tab, setTab] = useState<'export' | 'import'>(initialTab);
  const [rawJsonText, setRawJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copiedMd, setCopiedMd] = useState(false);

  const [googleUser, setGoogleUser] = useState<User | null>(() => getCurrentUser());
  const [hasGoogleToken, setHasGoogleToken] = useState<boolean>(() => Boolean(getAccessToken()));
  const [docTitleInput, setDocTitleInput] = useState(map.title || 'Concept Map');
  const [confirmGoogleCreate, setConfirmGoogleCreate] = useState(false);
  const [isExportingDoc, setIsExportingDoc] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleResult, setGoogleResult] = useState<GoogleDocExportResult | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab, open]);

  useEffect(() => {
    setDocTitleInput(map.title || 'Concept Map');
    setGoogleResult(null);
    setGoogleError(null);
    setConfirmGoogleCreate(false);
  }, [map.title, open]);

  useEffect(() => {
    const unsub = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setHasGoogleToken(Boolean(token));
      },
      (user) => {
        setGoogleUser(user);
        setHasGoogleToken(false);
      }
    );
    return () => unsub();
  }, []);

  if (!open) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      setRawJsonText(text);
      try {
        const parsed = parseImportedContent(text, file.name);
        onImportMap(parsed);
        onClose();
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Unable to parse file.');
      }
    };
    reader.readAsText(file);
  };

  const handleImportFromText = () => {
    setImportError(null);
    try {
      const parsed = parseImportedContent(rawJsonText);
      onImportMap(parsed);
      onClose();
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Unable to parse content.');
    }
  };

  const handleCopyMarkdown = async () => {
    const md = generateMarkdown(map, language);
    await navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 1800);
  };

  const handleGoogleSignIn = async () => {
    setGoogleError(null);
    setIsLoggingIn(true);
    try {
      const { user, accessToken } = await googleSignIn();
      setGoogleUser(user);
      setHasGoogleToken(Boolean(accessToken));
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : 'Google sign-in failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCreateGoogleDoc = async () => {
    const token = getAccessToken();
    if (!token) {
      setHasGoogleToken(false);
      setGoogleError('Please sign in with Google first to authorize Google Docs export.');
      return;
    }

    setGoogleError(null);
    setIsExportingDoc(true);
    try {
      const result = await exportMapToGoogleDoc(map, token, docTitleInput, language);
      setGoogleResult(result);
      setConfirmGoogleCreate(false);
    } catch (err) {
      setGoogleError(
        err instanceof Error ? err.message : 'Failed to create Google Doc.'
      );
    } finally {
      setIsExportingDoc(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="io-modal-title"
        className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-4">
            <h2 id="io-modal-title" className="font-display text-lg font-bold text-slate-900">
              {t.title}
            </h2>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setTab('export')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  tab === 'export'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.exportTab}
              </button>
              <button
                type="button"
                onClick={() => setTab('import')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  tab === 'import'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.importTab}
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close import and export modal"
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {tab === 'export' ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* JSON Export */}
                <div className="p-4 border border-slate-200 rounded-lg flex flex-col justify-between gap-3 bg-white">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <FileCode2 className="w-4 h-4 text-blue-700" />
                      <span>{t.jsonTitle}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">{t.jsonDesc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => exportToJson(map)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.downloadJson}</span>
                  </button>
                </div>

                {/* Markdown Export */}
                <div className="p-4 border border-slate-200 rounded-lg flex flex-col justify-between gap-3 bg-white">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <FileText className="w-4 h-4 text-blue-700" />
                      <span>{t.mdTitle}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">{t.mdDesc}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => exportToMarkdown(map, language)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>.md</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyMarkdown}
                      title="Copy Markdown to clipboard"
                      className="inline-flex items-center justify-center p-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedMd ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* PDF Export */}
                <div className="p-4 border border-slate-200 rounded-lg flex flex-col justify-between gap-3 bg-white">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Printer className="w-4 h-4 text-blue-700" />
                      <span>{t.pdfTitle}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">{t.pdfDesc}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => exportToPdf(map, language)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.downloadPdf}</span>
                  </button>
                </div>
              </div>

              {/* Google Docs Export Section */}
              <div className="p-5 border border-slate-200 rounded-lg bg-slate-50/60 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{t.gdocsTitle}</h3>
                    <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                      {t.gdocsDesc}
                    </p>
                  </div>
                  {googleUser && hasGoogleToken && (
                    <button
                      type="button"
                      onClick={() => logoutGoogle()}
                      className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t.signOut}</span>
                    </button>
                  )}
                </div>

                {!hasGoogleToken ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <span className="text-xs text-slate-600">{t.signInPrompt}</span>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isLoggingIn}
                      dir="ltr"
                      className="gsi-material-button shrink-0"
                    >
                      <div className="gsi-material-button-state" />
                      <div className="gsi-material-button-content-wrapper">
                        <div className="gsi-material-button-icon">
                          <svg
                            version="1.1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 48 48"
                            style={{ display: 'block' }}
                          >
                            <path
                              fill="#EA4335"
                              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                            />
                            <path
                              fill="#4285F4"
                              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                            />
                            <path
                              fill="#34A853"
                              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                            />
                            <path fill="none" d="M0 0h48v48H0z" />
                          </svg>
                        </div>
                        <span className="gsi-material-button-contents">
                          {isLoggingIn ? t.signingInBtn : t.signInBtn}
                        </span>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {googleUser?.email && (
                      <div className="text-xs text-slate-600">
                        {t.signedInAs}{' '}
                        <span className="font-medium text-slate-900">{googleUser.email}</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={docTitleInput}
                        onChange={(e) => setDocTitleInput(e.target.value)}
                        placeholder={t.docTitlePlaceholder}
                        className="flex-1 px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      {!confirmGoogleCreate ? (
                        <button
                          type="button"
                          onClick={() => setConfirmGoogleCreate(true)}
                          className="px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          {t.exportGdocsBtn}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={handleCreateGoogleDoc}
                            disabled={isExportingDoc}
                            className="px-4 py-2 text-xs font-medium text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg whitespace-nowrap cursor-pointer disabled:opacity-60"
                          >
                            {isExportingDoc ? t.creatingBtn : t.confirmCreateBtn}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmGoogleCreate(false)}
                            disabled={isExportingDoc}
                            className="px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 cursor-pointer"
                          >
                            {t.cancel}
                          </button>
                        </div>
                      )}
                    </div>

                    {confirmGoogleCreate && (
                      <p className="text-xs text-slate-600">
                        {t.confirmNotice(
                          docTitleInput || map.title,
                          map.concepts.length,
                          map.links.length
                        )}
                      </p>
                    )}

                    {googleResult && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-emerald-900">
                          {t.createdSuccess(googleResult.title)}
                        </span>
                        <a
                          href={googleResult.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline whitespace-nowrap shrink-0"
                        >
                          <span>{t.openDocument}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {googleError && (
                  <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {googleError}
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="p-5 border border-dashed border-slate-300 rounded-lg bg-slate-50/70 text-center space-y-3">
                <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                <div>
                  <p className="text-sm font-medium text-slate-800">{t.uploadTitle}</p>
                  <p className="text-xs text-slate-500 mt-1">{t.uploadDesc}</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.md,.markdown,application/json,text/markdown,text/plain"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg cursor-pointer"
                >
                  {t.chooseFile}
                </button>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="paste-json-area"
                  className="block text-xs font-semibold text-slate-700"
                >
                  {t.pasteLabel}
                </label>
                <textarea
                  id="paste-json-area"
                  dir="ltr"
                  rows={7}
                  value={rawJsonText}
                  onChange={(e) => setRawJsonText(e.target.value)}
                  placeholder={'{"title": "My Map", "concepts": [...], "links": []}\n\n# Or Markdown:\n### Concept A\n- **Definition:** ...\n- *Concept A* — **drives** → *Concept B*'}
                  className="w-full p-3 font-mono text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {importError && (
                <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {importError}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="button"
                  onClick={handleImportFromText}
                  disabled={!rawJsonText.trim()}
                  className="px-4 py-2 text-xs font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg disabled:opacity-50 cursor-pointer"
                >
                  {t.importBtn}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
