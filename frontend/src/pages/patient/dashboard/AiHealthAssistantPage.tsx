import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  BotMessageSquare,
  Sparkles,
  ShieldCheck,
  Send,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
  Mic,
  Square,
  Volume2,
  VolumeX,
  User,
  Plus,
  RotateCcw,
} from "lucide-react";
import { Card } from "../../../components/ui/Card";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { MedicalIcon } from "../../../components/healthcare/MedicalIcon";
import { usePatientRecord } from "../../../context/PatientContext";
import { useOnClickOutside } from "../../../hooks/useOnClickOutside";
import {
  ASSISTANT_FOOTER_DISCLAIMER,
  SUGGESTED_PROMPTS,
  generateAssistantReply,
  nowTimestamp,
  type ChatAttachment,
  type ChatMessage,
} from "../../../utils/aiAssistant";
import { renderChatContent, stripChatMarkup } from "../../../utils/chatMarkdown";
import { entranceTransition, fadeInUp, staggerContainer, staggerItem } from "../../../utils/motion";

const WELCOME_MESSAGE =
  "Hi! I'm your MediKiosk Health Assistant. I can help you understand your health records, reports, medicines, visits, and other health information.";

function createMessageId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `msg-${Date.now()}-${Math.random()}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Minimal shape of the browser's SpeechRecognition API — not in TS's default lib. */
interface MinimalSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: unknown) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

function getSpeechRecognitionCtor(): (new () => MinimalSpeechRecognition) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => MinimalSpeechRecognition;
    webkitSpeechRecognition?: new () => MinimalSpeechRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;

export default function AiHealthAssistantPage() {
  const patient = usePatientRecord();
  const prefersReducedMotion = useReducedMotion();

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", content: WELCOME_MESSAGE, timestamp: nowTimestamp() },
  ]);
  const [input, setInput] = useState("");
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceUnsupportedNotice, setVoiceUnsupportedNotice] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const uploadMenuRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<MinimalSpeechRecognition | null>(null);

  useOnClickOutside(uploadMenuRef, () => setUploadMenuOpen(false));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  }, [messages, isTyping, prefersReducedMotion]);

  // Revoke local object URLs on unmount so we don't leak memory — nothing here ever leaves the device.
  useEffect(() => {
    return () => {
      pendingAttachments.forEach((a) => {
        if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessage = (text: string, attachments: ChatAttachment[] = []) => {
    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0) return;

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmed,
      timestamp: nowTimestamp(),
      attachments: attachments.length ? attachments : undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setPendingAttachments([]);
    setIsTyping(true);

    const replyDelay = 450 + Math.random() * 450;
    window.setTimeout(() => {
      const replyText =
        attachments.length > 0 && !trimmed
          ? "Thanks — I've noted the attachment. I can't read image or document contents yet in this offline preview, but you can describe what it shows and I'll help you understand it alongside your stored records."
          : generateAssistantReply(trimmed, patient);
      setMessages((prev) => [
        ...prev,
        { id: createMessageId(), role: "assistant", content: replyText, timestamp: nowTimestamp() },
      ]);
      setIsTyping(false);
    }, replyDelay);
  };

  const handleSend = () => sendMessage(input, pendingAttachments);

  const handleInputKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedPrompt = (query: string) => sendMessage(query);

  const addAttachments = (files: FileList | null, kind: ChatAttachment["kind"]) => {
    if (!files || files.length === 0) return;
    const next: ChatAttachment[] = Array.from(files).map((file) => ({
      id: createMessageId(),
      kind,
      name: file.name,
      size: file.size,
      fileType: file.type || (kind === "image" ? "image" : "file"),
      previewUrl: kind === "image" ? URL.createObjectURL(file) : null,
    }));
    setPendingAttachments((prev) => [...prev, ...next]);
    setUploadMenuOpen(false);
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    addAttachments(e.target.files, "image");
    e.target.value = "";
  };

  const handleDocumentChange = (e: ChangeEvent<HTMLInputElement>) => {
    addAttachments(e.target.files, "document");
    e.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setPendingAttachments((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((a) => a.id !== id);
    });
  };

  const toggleVoiceInput = () => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setVoiceUnsupportedNotice(true);
      window.setTimeout(() => setVoiceUnsupportedNotice(false), 4000);
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new Ctor();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event: unknown) => {
      const result = event as { results: { transcript: string }[][] };
      const transcript = result.results?.[0]?.[0]?.transcript;
      if (transcript) setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const speakMessage = (message: ChatMessage) => {
    if (!speechSupported) return;
    if (speakingMessageId === message.id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(stripChatMarkup(message.content));
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);
    setSpeakingMessageId(message.id);
    window.speechSynthesis.speak(utterance);
  };

  const clearConversation = () => {
    if (isListening) recognitionRef.current?.stop();
    if (speakingMessageId) window.speechSynthesis?.cancel();
    pendingAttachments.forEach((a) => {
      if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
    });
    setMessages([{ id: "welcome", role: "assistant", content: WELCOME_MESSAGE, timestamp: nowTimestamp() }]);
    setPendingAttachments([]);
    setInput("");
    setIsListening(false);
    setSpeakingMessageId(null);
    setClearConfirmOpen(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-bold text-mx-ink sm:text-3xl">AI Health Assistant</h1>
            <Badge tone="purple" icon={<Sparkles size={12} aria-hidden="true" />}>
              Informational
            </Badge>
          </div>
          <p className="mt-1 text-sm text-mx-ink-muted">
            Ask questions about your health information, reports, medicines, visits, and records.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="green" icon={<ShieldCheck size={12} aria-hidden="true" />} className="whitespace-normal text-left">
            Your health information stays on this device
          </Badge>
          <button
            type="button"
            onClick={() => setClearConfirmOpen(true)}
            disabled={messages.length <= 1}
            aria-label="Clear conversation"
            className="flex h-9 items-center gap-1.5 rounded-mx-sm border border-mx-border px-3 text-xs font-semibold text-mx-ink-soft transition-colors hover:bg-mx-surface-sunken hover:text-mx-ink disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <RotateCcw size={13} aria-hidden="true" />
            Clear
          </button>
        </div>
      </div>

      <Modal
        isOpen={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        title="Clear this conversation?"
        description="This removes every message and attachment in this chat. It can't be undone."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setClearConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={clearConversation}>
              Clear conversation
            </Button>
          </>
        }
      >
        <p className="text-sm text-mx-ink-muted">Your records themselves aren't affected — only this chat history.</p>
      </Modal>

      <Card padded={false} className="flex h-[70vh] min-h-[480px] flex-col overflow-hidden">
        {/* Conversation area */}
        <div className="mx-scrollbar flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5">
          {messages.length === 1 && (
            <motion.div
              initial={prefersReducedMotion ? false : "hidden"}
              animate="show"
              variants={prefersReducedMotion ? undefined : fadeInUp}
              className="mb-2"
            >
              <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <motion.div
                  className="contents"
                  initial={prefersReducedMotion ? "show" : "hidden"}
                  animate="show"
                  variants={prefersReducedMotion ? undefined : staggerContainer()}
                >
                  {SUGGESTED_PROMPTS.map((prompt) => (
                    <motion.div key={prompt.id} variants={prefersReducedMotion ? undefined : staggerItem}>
                      <button
                        type="button"
                        onClick={() => handleSuggestedPrompt(prompt.query)}
                        className="w-full rounded-mx-md border border-mx-border bg-mx-surface-raised px-3.5 py-2.5 text-left text-sm font-medium text-mx-ink-soft transition-colors hover:border-mx-purple/40 hover:bg-mx-purple-soft hover:text-mx-purple"
                      >
                        {prompt.label}
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={entranceTransition}
                className={`flex gap-2.5 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <MedicalIcon
                  icon={message.role === "assistant" ? BotMessageSquare : User}
                  tone={message.role === "assistant" ? "purple" : "blue"}
                  size={15}
                  className="mt-0.5 h-8 w-8 shrink-0"
                />
                <div className={`flex max-w-[80%] flex-col gap-1 ${message.role === "user" ? "items-end" : "items-start"}`}>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {message.attachments.map((att) =>
                        att.kind === "image" && att.previewUrl ? (
                          <img
                            key={att.id}
                            src={att.previewUrl}
                            alt={att.name}
                            className="h-20 w-20 rounded-mx-sm border border-mx-border object-cover"
                          />
                        ) : (
                          <div
                            key={att.id}
                            className="flex items-center gap-2 rounded-mx-sm border border-mx-border bg-mx-surface px-2.5 py-2 text-xs text-mx-ink-soft"
                          >
                            <FileText size={14} aria-hidden="true" />
                            <span className="max-w-[140px] truncate">{att.name}</span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                  {message.content && (
                    <div
                      className={`min-w-0 rounded-mx-md px-3.5 py-2.5 text-sm ${
                        message.role === "user"
                          ? "bg-mx-green text-mx-ink-inverse"
                          : "border border-mx-border bg-mx-surface-raised text-mx-ink"
                      }`}
                    >
                      {renderChatContent(message.content)}
                    </div>
                  )}
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[11px] text-mx-ink-muted">{message.timestamp}</span>
                    {message.role === "assistant" && speechSupported && message.content && (
                      <button
                        type="button"
                        onClick={() => speakMessage(message)}
                        aria-label={speakingMessageId === message.id ? "Stop speaking" : "Speak response"}
                        className="text-mx-ink-muted hover:text-mx-purple"
                      >
                        {speakingMessageId === message.id ? (
                          <VolumeX size={12} aria-hidden="true" />
                        ) : (
                          <Volume2 size={12} aria-hidden="true" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2.5"
              role="status"
              aria-live="polite"
            >
              <MedicalIcon icon={BotMessageSquare} tone="purple" size={15} className="h-8 w-8 shrink-0" />
              <div className="flex items-center gap-1 rounded-mx-md border border-mx-border bg-mx-surface-raised px-3.5 py-3">
                <span className="sr-only">Assistant is typing…</span>
                {prefersReducedMotion ? (
                  <span aria-hidden="true" className="text-xs text-mx-ink-muted">Typing…</span>
                ) : (
                  [0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      aria-hidden="true"
                      className="h-1.5 w-1.5 rounded-full bg-mx-ink-muted"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))
                )}
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Voice mode / unsupported notice */}
        <AnimatePresence>
          {(isListening || voiceUnsupportedNotice) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-mx-border bg-mx-purple-soft px-4 py-2.5 sm:px-5"
            >
              {isListening ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-mx-purple">
                    <span className="flex h-2 w-2 items-center justify-center">
                      <motion.span
                        className="h-2 w-2 rounded-full bg-mx-purple"
                        animate={prefersReducedMotion ? undefined : { scale: [1, 1.6, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    </span>
                    Listening…
                  </div>
                  <button
                    type="button"
                    onClick={toggleVoiceInput}
                    className="flex items-center gap-1 rounded-full bg-mx-purple px-3 py-1 text-xs font-semibold text-mx-ink-inverse"
                  >
                    <Square size={10} aria-hidden="true" /> Stop
                  </button>
                </div>
              ) : (
                <p className="text-xs font-medium text-mx-purple">
                  Voice input isn't supported in this browser. You can continue using text.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attachment previews */}
        {pendingAttachments.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-mx-border px-4 py-2.5 sm:px-5">
            {pendingAttachments.map((att) => (
              <div
                key={att.id}
                className="relative flex items-center gap-2 rounded-mx-sm border border-mx-border bg-mx-surface-sunken px-2.5 py-1.5 pr-7 text-xs text-mx-ink-soft"
              >
                {att.kind === "image" && att.previewUrl ? (
                  <img src={att.previewUrl} alt={att.name} className="h-8 w-8 rounded object-cover" />
                ) : (
                  <FileText size={14} aria-hidden="true" />
                )}
                <div className="max-w-[120px]">
                  <p className="truncate font-medium">{att.name}</p>
                  <p className="text-[10px] text-mx-ink-muted">{formatFileSize(att.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  aria-label={`Remove ${att.name}`}
                  className="absolute right-1.5 top-1.5 text-mx-ink-muted hover:text-mx-danger"
                >
                  <X size={13} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="border-t border-mx-border bg-mx-surface-raised px-3 py-3 sm:px-4">
          <div className="flex items-end gap-2">
            <div className="relative" ref={uploadMenuRef}>
              <button
                type="button"
                onClick={() => setUploadMenuOpen((v) => !v)}
                aria-label="Add attachment"
                aria-expanded={uploadMenuOpen}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-mx-ink-muted hover:bg-mx-surface-sunken hover:text-mx-ink"
              >
                <Plus size={18} aria-hidden="true" />
              </button>
              <AnimatePresence>
                {uploadMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute bottom-12 left-0 z-10 w-44 overflow-hidden rounded-mx-md border border-mx-border bg-mx-surface-raised shadow-mx-md"
                  >
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-mx-ink-soft hover:bg-mx-surface-sunken"
                    >
                      <ImageIcon size={15} aria-hidden="true" /> Upload image
                    </button>
                    <button
                      type="button"
                      onClick={() => documentInputRef.current?.click()}
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-mx-ink-soft hover:bg-mx-surface-sunken"
                    >
                      <Paperclip size={15} aria-hidden="true" /> Upload document
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
              <input
                ref={documentInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                multiple
                className="hidden"
                onChange={handleDocumentChange}
              />
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              rows={1}
              placeholder="Ask your health question..."
              className="mx-scrollbar max-h-28 flex-1 resize-none rounded-mx-md border border-mx-border-strong bg-mx-surface px-3.5 py-2.5 text-sm text-mx-ink placeholder:text-mx-ink-muted focus:border-mx-blue"
            />

            <button
              type="button"
              onClick={toggleVoiceInput}
              aria-label={isListening ? "Stop voice input" : "Start voice input"}
              aria-pressed={isListening}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                isListening ? "bg-mx-purple text-mx-ink-inverse" : "text-mx-ink-muted hover:bg-mx-surface-sunken hover:text-mx-ink"
              }`}
            >
              <Mic size={17} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() && pendingAttachments.length === 0}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mx-green text-mx-ink-inverse transition-colors hover:bg-mx-green-strong disabled:bg-mx-border disabled:text-mx-ink-muted"
            >
              <Send size={16} aria-hidden="true" />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] leading-snug text-mx-ink-muted">{ASSISTANT_FOOTER_DISCLAIMER}</p>
        </div>
      </Card>
    </div>
  );
}