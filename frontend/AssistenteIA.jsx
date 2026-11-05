import React, { useEffect, useRef, useState } from 'react';

/**
 * Componente independente de estilo, para incorporar à aplicação React existente.
 * sendMessage(message) deve chamar um endpoint AUTENTICADO da própria plataforma,
 * nunca expor OPENAI_API_KEY nem APP_API_TOKEN no navegador.
 */
export default function AssistenteIA({ sendMessage, title = 'Assistente IA', onProposedAction }) {
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const recognition = useRef(null);

  useEffect(() => () => { recognition.current?.abort?.(); }, []);

  async function submit(event) {
    event?.preventDefault();
    const text = message.trim();
    if (!text || busy) return;
    setMessage('');
    setBusy(true);
    setHistory(old => [...old, { role: 'user', text }]);
    try {
      const result = await sendMessage(text);
      if (typeof result?.reply !== 'string') throw new Error('Resposta inesperada');
      setHistory(old => [...old, {
        role: 'assistant',
        text: result.reply,
        action: result.proposed_action || null,
      }]);
    } catch {
      setHistory(old => [...old, { role: 'assistant', text: 'Não foi possível consultar a IA. Tente novamente.' }]);
    } finally {
      setBusy(false);
    }
  }

  function toggleVoice() {
    if (listening) {
      recognition.current?.stop?.();
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHistory(old => [...old, { role: 'assistant', text: 'O navegador não oferece reconhecimento de voz neste dispositivo.' }]);
      return;
    }
    const recognizer = new SpeechRecognition();
    recognition.current = recognizer;
    recognizer.lang = 'pt-BR';
    recognizer.interimResults = false;
    recognizer.onresult = event => setMessage(old => [old, event.results[0][0].transcript].filter(Boolean).join(' '));
    recognizer.onerror = () => setListening(false);
    recognizer.onend = () => setListening(false);
    try { recognizer.start(); setListening(true); } catch { setListening(false); }
  }

  return (
    <section aria-label={title} style={{ border: '1px solid #d8dfe8', borderRadius: 16, padding: 18, background: '#fff', color: '#172334', maxWidth: 660 }}>
      <header style={{ fontWeight: 700, fontSize: 18, marginBottom: 12 }}>{title}</header>
      <div aria-live="polite" style={{ maxHeight: 300, overflowY: 'auto', display: 'grid', gap: 8 }}>
        {history.length === 0 && <p>O que deseja fazer hoje? Posso ajudar com prioridades, tarefas e visitas.</p>}
        {history.map((entry, i) => (
          <div key={i} style={{ borderRadius: 10, padding: 10, background: entry.role === 'user' ? '#eaf2ff' : '#f5f7fa' }}>
            <strong>{entry.role === 'user' ? 'Você' : 'Assistente'}</strong>
            <p style={{ whiteSpace: 'pre-wrap', margin: '6px 0' }}>{entry.text}</p>
            {entry.action && (
              <div>
                <small>Proposta (não executada): {entry.action.type}</small>
                {onProposedAction && (
                  <button type="button" onClick={() => onProposedAction(entry.action)}>
                    Revisar ação
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={submit} style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <input aria-label="Mensagem para a IA" value={message} onChange={e => setMessage(e.target.value)}
          placeholder="O que deseja fazer?" maxLength={2000} style={{ flex: 1, minWidth: 0, padding: 10, borderRadius: 8, border: '1px solid #b8c4d4' }} />
        <button type="button" onClick={toggleVoice} aria-label={listening ? 'Parar gravação' : 'Ditado por voz'} aria-pressed={listening}>
          {listening ? 'Parar' : '🎙️'}
        </button>
        <button type="submit" disabled={busy || !message.trim()}>{busy ? 'Enviando...' : 'Enviar'}</button>
      </form>
    </section>
  );
}
