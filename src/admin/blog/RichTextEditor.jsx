import React, { useRef, useState, useEffect } from 'react';
import { 
  Bold, Italic, Heading2, Heading3, List, ListOrdered, 
  Quote, Link, Image, Undo, Redo, Code, Eye, AlertCircle, Upload 
} from 'lucide-react';
import { uploadBlogImage } from '../../services/blogService';
import { calculateReadingTime, sanitizeHtml } from '../../utils/sanitizeHtml';

export default function RichTextEditor({ 
  value = '', 
  onChange, 
  placeholder = 'Begin penning your editorial article...' 
}) {
  const editorRef = useRef(null);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [sourceCode, setSourceCode] = useState(value);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [isUploadingInline, setIsUploadingInline] = useState(false);
  const [savedSelection, setSavedSelection] = useState(null);

  // Sync internal editor content when value changes externally (and not in source mode)
  useEffect(() => {
    if (!isSourceMode && editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
    setSourceCode(value || '');
  }, [value, isSourceMode]);

  // Execute formatting command
  const executeCommand = (command, commandValue = null) => {
    if (isSourceMode) return;
    editorRef.current?.focus();
    document.execCommand(command, false, commandValue);
    handleEditorInput();
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setSourceCode(html);
      onChange?.(html);
    }
  };

  // Save current cursor selection
  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      setSavedSelection(sel.getRangeAt(0));
    }
  };

  // Restore cursor selection
  const restoreSelection = () => {
    if (savedSelection) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedSelection);
    }
  };

  // Open Link Modal
  const openLinkModal = () => {
    saveSelection();
    const sel = window.getSelection();
    const selectedText = sel ? sel.toString() : '';
    setLinkText(selectedText);
    setLinkUrl('');
    setIsLinkModalOpen(true);
  };

  // Apply Link
  const applyLink = () => {
    if (!linkUrl) return;
    restoreSelection();
    const cleanUrl = linkUrl.startsWith('http://') || linkUrl.startsWith('https://') || linkUrl.startsWith('/') 
      ? linkUrl 
      : `https://${linkUrl}`;
    
    if (linkText && (!savedSelection || savedSelection.collapsed)) {
      document.execCommand('insertHTML', false, `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`);
    } else {
      document.execCommand('createLink', false, cleanUrl);
    }
    setIsLinkModalOpen(false);
    handleEditorInput();
  };

  // Open Image Modal
  const openImageModal = () => {
    saveSelection();
    setImageUrl('');
    setImageAlt('');
    setIsImageModalOpen(true);
  };

  // Apply Image
  const applyImage = () => {
    if (!imageUrl) return;
    restoreSelection();
    const cleanAlt = imageAlt.replace(/"/g, '&quot;');
    const imgHtml = `<figure class="my-6"><img src="${imageUrl}" alt="${cleanAlt}" class="editorial-content-img max-w-full h-auto rounded-none" />${imageAlt ? `<figcaption class="text-xs text-center text-[#8c867f] italic mt-2">${cleanAlt}</figcaption>` : ''}</figure><p><br></p>`;
    document.execCommand('insertHTML', false, imgHtml);
    setIsImageModalOpen(false);
    handleEditorInput();
  };

  // Handle inline image upload
  const handleInlineImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingInline(true);
      const uploadedUrl = await uploadBlogImage(file);
      setImageUrl(uploadedUrl);
      if (!imageAlt) {
        setImageAlt(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
      }
    } catch (err) {
      alert(`Inline image upload failed: ${err.message}`);
    } finally {
      setIsUploadingInline(false);
    }
  };

  // Toggle Source Mode
  const toggleSourceMode = () => {
    if (isSourceMode) {
      // Switching from code to visual: sanitize before setting innerHTML
      const sanitized = sanitizeHtml(sourceCode);
      if (editorRef.current) {
        editorRef.current.innerHTML = sanitized;
      }
      onChange?.(sanitized);
      setIsSourceMode(false);
    } else {
      // Switching from visual to code
      if (editorRef.current) {
        setSourceCode(editorRef.current.innerHTML);
      }
      setIsSourceMode(true);
    }
  };

  const handleSourceCodeChange = (e) => {
    const val = e.target.value;
    setSourceCode(val);
    onChange?.(val);
  };

  const readingTime = calculateReadingTime(isSourceMode ? sourceCode : (editorRef.current?.innerText || ''));
  const wordCount = (isSourceMode ? sourceCode.replace(/<[^>]*>/g, ' ') : (editorRef.current?.innerText || ''))
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div className="border border-[#e5dfd7] bg-white transition-all duration-150 focus-within:border-[#c5a880]">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[#fbf9f7] border-b border-[#e5dfd7] select-none text-[#4a4640]">
        
        {/* Headings */}
        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h2>')}
          className="p-1.5 hover:bg-[#ebe6e0] hover:text-[#1a1814] rounded-xs transition-colors cursor-pointer"
          title="Heading 2 (H2)"
          disabled={isSourceMode}
        >
          <Heading2 size={16} />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<h3>')}
          className="p-1.5 hover:bg-[#ebe6e0] hover:text-[#1a1814] rounded-xs transition-colors cursor-pointer"
          title="Heading 3 (H3)"
          disabled={isSourceMode}
        >
          <Heading3 size={16} />
        </button>

        <div className="w-[1px] h-4 bg-[#e5dfd7] mx-1" />

        {/* Text Formats */}
        <button
          type="button"
          onClick={() => executeCommand('bold')}
          className="p-1.5 hover:bg-[#ebe6e0] hover:text-[#1a1814] rounded-xs transition-colors cursor-pointer"
          title="Bold (Ctrl+B)"
          disabled={isSourceMode}
        >
          <Bold size={16} />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('italic')}
          className="p-1.5 hover:bg-[#ebe6e0] hover:text-[#1a1814] rounded-xs transition-colors cursor-pointer"
          title="Italic (Ctrl+I)"
          disabled={isSourceMode}
        >
          <Italic size={16} />
        </button>

        <div className="w-[1px] h-4 bg-[#e5dfd7] mx-1" />

        {/* Lists & Quotes */}
        <button
          type="button"
          onClick={() => executeCommand('insertUnorderedList')}
          className="p-1.5 hover:bg-[#ebe6e0] hover:text-[#1a1814] rounded-xs transition-colors cursor-pointer"
          title="Bullet List"
          disabled={isSourceMode}
        >
          <List size={16} />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('insertOrderedList')}
          className="p-1.5 hover:bg-[#ebe6e0] hover:text-[#1a1814] rounded-xs transition-colors cursor-pointer"
          title="Numbered List"
          disabled={isSourceMode}
        >
          <ListOrdered size={16} />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('formatBlock', '<blockquote>')}
          className="p-1.5 hover:bg-[#ebe6e0] hover:text-[#1a1814] rounded-xs transition-colors cursor-pointer"
          title="Pull Quote / Blockquote"
          disabled={isSourceMode}
        >
          <Quote size={16} />
        </button>

        <div className="w-[1px] h-4 bg-[#e5dfd7] mx-1" />

        {/* Links & Media */}
        <button
          type="button"
          onClick={openLinkModal}
          className="p-1.5 hover:bg-[#ebe6e0] hover:text-[#1a1814] rounded-xs transition-colors cursor-pointer"
          title="Insert Link"
          disabled={isSourceMode}
        >
          <Link size={16} />
        </button>

        <button
          type="button"
          onClick={openImageModal}
          className="p-1.5 hover:bg-[#ebe6e0] hover:text-[#1a1814] rounded-xs transition-colors cursor-pointer"
          title="Insert Inline Image"
          disabled={isSourceMode}
        >
          <Image size={16} />
        </button>

        <div className="w-[1px] h-4 bg-[#e5dfd7] mx-1" />

        {/* Undo / Redo */}
        <button
          type="button"
          onClick={() => executeCommand('undo')}
          className="p-1.5 hover:bg-[#ebe6e0] hover:text-[#1a1814] rounded-xs transition-colors cursor-pointer"
          title="Undo (Ctrl+Z)"
          disabled={isSourceMode}
        >
          <Undo size={15} />
        </button>

        <button
          type="button"
          onClick={() => executeCommand('redo')}
          className="p-1.5 hover:bg-[#ebe6e0] hover:text-[#1a1814] rounded-xs transition-colors cursor-pointer"
          title="Redo (Ctrl+Y)"
          disabled={isSourceMode}
        >
          <Redo size={15} />
        </button>

        {/* Right side: HTML source toggle & stats */}
        <div className="ml-auto flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-[#8c867f]">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>~{readingTime} min read</span>
          </div>

          <button
            type="button"
            onClick={toggleSourceMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs uppercase tracking-wider font-medium border transition-colors cursor-pointer ${
              isSourceMode
                ? 'bg-[#1a1814] text-white border-[#1a1814]'
                : 'bg-white text-[#4a4640] border-[#d8d2ca] hover:bg-[#f0ebe3]'
            }`}
            title={isSourceMode ? 'Switch to Visual Editor' : 'Switch to HTML Source Code'}
          >
            {isSourceMode ? <Eye size={13} /> : <Code size={13} />}
            <span>{isSourceMode ? 'Visual' : 'HTML'}</span>
          </button>
        </div>

      </div>

      {/* Editor Content Area */}
      <div className="relative min-h-[360px]">
        {isSourceMode ? (
          <textarea
            value={sourceCode}
            onChange={handleSourceCodeChange}
            className="w-full min-h-[360px] p-4 font-mono text-[13px] text-[#1a1814] bg-[#faf8f6] focus:outline-none resize-y border-none"
            placeholder="Type or paste HTML markup directly..."
          />
        ) : (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            onBlur={handleEditorInput}
            className="w-full min-h-[360px] p-5 focus:outline-none prose prose-stone max-w-none text-[#1a1814] leading-relaxed cursor-text selection:bg-[#c5a880]/20"
            style={{
              fontFamily: 'system-ui, -apple-system, sans-serif'
            }}
            data-placeholder={placeholder}
          />
        )}
      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-[#fcfbf9] border-t border-[#f0eae2] flex items-center justify-between text-[11px] text-[#8c867f]">
        <span>Rich Text Editorial Editor • Formatted as clean, semantic HTML</span>
        <span className="sm:hidden">{wordCount} words • ~{readingTime} min read</span>
      </div>

      {/* Insert Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 shadow-2xl border border-[#c5a880]/30 space-y-4">
            <h4 className="text-sm uppercase tracking-widest font-semibold text-[#1a1814]">
              Insert Editorial Link
            </h4>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#6b655e] mb-1">
                Link Text
              </label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="e.g. Pure Silk Dupatta"
                className="w-full px-3 py-2 border border-[#d8d2ca] text-sm focus:outline-none focus:border-[#c5a880]"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#6b655e] mb-1">
                URL Address (Web or Local)
              </label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://yasraftextiles.com/collections or /about"
                className="w-full px-3 py-2 border border-[#d8d2ca] text-sm focus:outline-none focus:border-[#c5a880]"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="px-4 py-2 text-xs uppercase tracking-wider border border-[#d8d2ca] hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyLink}
                disabled={!linkUrl}
                className="px-4 py-2 text-xs uppercase tracking-wider bg-[#1a1814] text-white hover:bg-[#c5a880] transition-colors disabled:opacity-50"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert Inline Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full p-6 shadow-2xl border border-[#c5a880]/30 space-y-4">
            <h4 className="text-sm uppercase tracking-widest font-semibold text-[#1a1814]">
              Insert Inline Editorial Photography
            </h4>

            {/* Upload or URL */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#6b655e] mb-1.5">
                  Upload Image from Device
                </label>
                <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-[#d8d2ca] hover:border-[#c5a880] bg-[#faf8f6] cursor-pointer transition-colors text-xs text-[#6b655e]">
                  <Upload size={16} className={isUploadingInline ? 'animate-bounce text-[#c5a880]' : 'text-[#8c867f]'} />
                  <span>{isUploadingInline ? 'Uploading to Atelier Storage...' : 'Select image file (JPG, PNG, WebP)'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleInlineImageUpload}
                    disabled={isUploadingInline}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="text-center text-xs text-[#8c867f] uppercase tracking-widest">— OR —</div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#6b655e] mb-1">
                  Image URL / Relative Path
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="/products/yasraf-gul-e-dawood-mustard-1.png or https://..."
                  className="w-full px-3 py-2 border border-[#d8d2ca] text-sm focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#6b655e] mb-1">
                  Alt Text & Caption (Required for Accessibility)
                </label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="e.g. Detailed view of handcrafted Schiffli cutwork on pure lawn"
                  className="w-full px-3 py-2 border border-[#d8d2ca] text-sm focus:outline-none focus:border-[#c5a880]"
                />
              </div>

              {imageUrl && (
                <div className="p-2 bg-[#f5f2ed] border border-[#e5dfd7]">
                  <p className="text-[11px] text-[#6b655e] uppercase tracking-wider mb-1">Preview:</p>
                  <img src={imageUrl} alt={imageAlt || 'Preview'} className="max-h-36 mx-auto object-contain" />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="px-4 py-2 text-xs uppercase tracking-wider border border-[#d8d2ca] hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyImage}
                disabled={!imageUrl}
                className="px-4 py-2 text-xs uppercase tracking-wider bg-[#1a1814] text-white hover:bg-[#c5a880] transition-colors disabled:opacity-50"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

