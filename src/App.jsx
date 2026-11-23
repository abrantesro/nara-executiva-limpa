import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Trash2,
  Lightbulb,
  Users,
  Compass,
  Mic,
  MicOff,
  Paperclip,
  X,
  Volume2,
  Square,
} from 'lucide-react';

const SYSTEM_PROMPT = `Você é NARA, a Secretária Executiva Inteligente do ecossistema AMZTECH.
Sua filosofia: "QUEM PRECISA. QUEM TEM. NARA CONECTA."

Seu papel:
- Acolher pessoas com diferentes níveis de conhecimento tecnológico, com inteligência, empatia, clareza e objetividade.
- Atuar como secretária executiva, assistente de planejamento e ponte entre necessidades, conhecimentos, serviços e oportunidades.
- No DECIDA AÍ: respeitar que YKMS é a arara mentora permanente do jogo, enquanto você (NARA) entra na "Hora do Estalo" quando surge uma ideia relevante para estruturar o projeto, analisar viabilidade, recursos e necessidades, organizar possibilidades de execução e encaminhar ao CONECTAR quando precisar de pessoas, parceiros ou recursos.
- Na AMZTECH: coordenar, orientar, organizar e acompanhar, sempre deixando claro quando algo ainda está em fase concebida, prototipada ou funcional/testada.
- Recurso de voz na tela: o site escreve suas respostas na tela, mantém o histórico salvo e possui leitura em voz alta em português do Brasil com o botão "Ouvir resposta". Nunca repita o que o usuário falou ou perguntou apenas para ecoar; vá direto para a resposta, orientação e próximo passo. Nunca diga que não consegue falar ou que opera apenas por texto.

Fluxo operacional de 9 etapas:
1. Escuta -> 02. Compreende -> 03. Pesquisa -> 04. Planeja -> 05. Valida -> 06. Executa -> 07. Verifica -> 08. Entrega -> 09. Acompanha.

Limites obrigatórios (nunca quebrar):
- Nunca inventar informações ou fatos.
- Nunca afirmar que realizou uma tarefa externa, financeira, contratual ou de publicação sem que isso tenha sido realmente feito e autorizado.
- Sempre pedir validação/autorização antes de ações externas, financeiras, contratuais ou irreversíveis.
- Nunca expor dados privados e não substituir especialistas humanos em decisões técnicas, médicas ou jurídicas.
- Responder sempre em português do Brasil, de forma acolhedora, organizada e com o próximo passo claro.`;

const PREFERRED_MODELS = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-flash-lite-latest'];

const cleanTextForSpeech = (rawText = '') => {
  return rawText
    .replace(/```[\s\S]*?```/g, ' bloco de código ')
    .replace(/[*#_`~>]+/g, ' ')
    .replace(/[📎⚠️❌✨]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export default function App() {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('nara_amztech_chat');
    return saved
      ? JSON.parse(saved)
      : [
          {
            role: 'model',
            text: 'Olá! Sou a NARA, sua Secretária Executiva Inteligente. QUEM PRECISA. QUEM TEM. NARA CONECTA. Como posso acolher, organizar ou estruturar o seu próximo passo hoje?',
          },
        ];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusNote, setStatusNote] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [speechStatus, setSpeechStatus] = useState('');
  const [attachment, setAttachment] = useState(null);

  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const committedTextRef = useRef('');

  useEffect(() => {
    localStorage.setItem('nara_amztech_chat', JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
    return () => {
      recognitionRef.current?.stop();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIdx(null);
    setSpeechStatus('');
  };

  const speakText = (text, index = null) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechStatus('Seu navegador não suporta leitura em voz alta.');
      return;
    }

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleaned);
    utterance.lang = 'pt-BR';
    utterance.rate = 1;
    utterance.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const ptVoice =
      voices.find((v) => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith('pt-br')) ||
      voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('pt'));
    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    utterance.onstart = () => {
      setSpeakingIdx(index);
      setSpeechStatus('NARA falando em voz alta...');
    };
    utterance.onend = () => {
      setSpeakingIdx(null);
      setSpeechStatus('');
    };
    utterance.onerror = (err) => {
      setSpeakingIdx(null);
      setSpeechStatus(
        err?.error === 'not-allowed'
          ? 'Toque em "Ouvir resposta" para liberar o áudio neste dispositivo.'
          : 'Não foi possível reproduzir o áudio neste dispositivo.'
      );
    };

    try {
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
    } catch {
      setSpeakingIdx(null);
      setSpeechStatus('Não foi possível iniciar o áudio.');
    }
  };

  const toggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('O seu navegador não suporta ditado por voz. Tente usar o Google Chrome ou Microsoft Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    stopSpeaking();
    committedTextRef.current = input.trim();

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let sessionFinal = '';
      let sessionInterim = '';

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript || '';
        if (result.isFinal) {
          sessionFinal += transcript + ' ';
        } else {
          sessionInterim += transcript;
        }
      }

      const prefix = committedTextRef.current ? `${committedTextRef.current} ` : '';
      const fullText = `${prefix}${sessionFinal}${sessionInterim}`.replace(/\s+/g, ' ').trim();
      setInput(fullText);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.toLowerCase().endsWith('.docx') || file.name.toLowerCase().endsWith('.doc')) {
      alert('Dica: Para a NARA ler documentos sem bloqueio, salve o arquivo em PDF (.pdf) ou texto (.txt) antes de anexar.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result.split(',')[1];
      setAttachment({
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        data: base64Data,
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const callGeminiFast = async (apiKey, contents) => {
    let lastError = 'Erro ao conectar com a API do Gemini.';

    for (const modelName of PREFERRED_MODELS) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      try {
        setStatusNote(`Respondendo (${modelName})...`);
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
              contents,
            }),
          }
        );
        clearTimeout(timeoutId);
        const data = await response.json();

        if (response.ok) {
          const reply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            'Não recebi resposta agora. Podemos tentar novamente com calma.';
          return { ok: true, reply };
        }

        lastError = data?.error?.message || lastError;
      } catch (err) {
        clearTimeout(timeoutId);
        lastError =
          err.name === 'AbortError'
            ? 'A conexão demorou mais do que o esperado.'
            : err.message || lastError;
      }
    }

    return { ok: false, error: lastError };
  };

  const sendMessage = async (customText) => {
    const textToSend = (customText || input).trim();
    if ((!textToSend && !attachment) || loading) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    stopSpeaking();

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', text: textToSend || `[Arquivo: ${attachment.name}]` },
        {
          role: 'model',
          text: '⚠️ Ainda falta cadastrar a chave VITE_GEMINI_API_KEY na Vercel e fazer um novo Deploy.',
        },
      ]);
      setInput('');
      setAttachment(null);
      return;
    }

    const currentAttachment = attachment;
    const displayUserText = currentAttachment
      ? `${textToSend ? textToSend + '\n' : ''}📎 Anexo: ${currentAttachment.name}`
      : textToSend;

    const updatedMessages = [
      ...messages,
      { role: 'user', text: displayUserText, attachment: currentAttachment },
    ];
    const nextModelIndex = updatedMessages.length;

    setMessages(updatedMessages);
    setInput('');
    committedTextRef.current = '';
    setAttachment(null);
    setLoading(true);
    setStatusNote('NARA está organizando e gravando sua resposta...');

    try {
      const recentHistory = updatedMessages.slice(-16).map((m) => {
        const parts = [];
        if (m.text) parts.push({ text: m.text });
        if (m.attachment) {
          parts.push({
            inlineData: {
              mimeType: m.attachment.mimeType,
              data: m.attachment.data,
            },
          });
        }
        return {
          role: m.role === 'model' ? 'model' : 'user',
          parts,
        };
      });

      const result = await callGeminiFast(apiKey, recentHistory);

      if (result.ok) {
        setMessages((prev) => [...prev, { role: 'model', text: result.reply }]);
        speakText(result.reply, nextModelIndex);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'model', text: `❌ Encontrei um bloqueio na conexão: ${result.error}` },
        ]);
      }
    } finally {
      setLoading(false);
      setStatusNote('');
    }
  };

  const clearHistory = () => {
    stopSpeaking();
    const initial = [
      {
        role: 'model',
        text: 'Conversa reiniciada com carinho. Qual demanda, ideia ou projeto vamos organizar agora?',
      },
    ];
    setMessages(initial);
    setAttachment(null);
    localStorage.setItem('nara_amztech_chat', JSON.stringify(initial));
  };

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto p-4">
      <header className="flex items-center justify-between bg-emerald-950/90 border border-emerald-700/50 rounded-2xl p-4 mb-4 shadow-lg gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 via-amber-400 to-sky-500 flex items-center justify-center font-bold text-slate-950 text-xl shadow">
            N
          </div>
          <div>
            <h1 className="text-xl font-bold text-amber-400 flex items-center gap-2">
              NARA <Sparkles className="w-4 h-4 text-emerald-400" />
            </h1>
            <p className="text-xs text-emerald-200">
              Secretária Executiva • AMZTECH • Quem precisa. Quem tem. NARA conecta.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={clearHistory}
          title="Limpar conversa"
          className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 px-3 py-2 rounded-lg border border-slate-700 transition"
        >
          <Trash2 className="w-4 h-4" /> Nova conversa
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        <button
          type="button"
          onClick={() =>
            sendMessage(
              'Tive uma ideia no DECIDA AÍ (Hora do Estalo). Me ajude a estruturar o projeto, analisar viabilidade, recursos e próximos passos.'
            )
          }
          className="flex items-center gap-2 bg-slate-900 hover:bg-emerald-900/40 border border-slate-800 hover:border-amber-500 p-3 rounded-xl text-sm text-left transition"
        >
          <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Hora do Estalo (DECIDA AÍ)</span>
        </button>
        <button
          type="button"
          onClick={() =>
            sendMessage(
              'Preciso organizar um plano de ação e acompanhar etapas de uma demanda na AMZTECH.'
            )
          }
          className="flex items-center gap-2 bg-slate-900 hover:bg-emerald-900/40 border border-slate-800 hover:border-emerald-500 p-3 rounded-xl text-sm text-left transition"
        >
          <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Planejar na AMZTECH</span>
        </button>
        <button
          type="button"
          onClick={() =>
            sendMessage(
              'Quero mapear quem precisa de ajuda, quem pode oferecer ajuda e como encaminhar ao CONECTAR.'
            )
          }
          className="flex items-center gap-2 bg-slate-900 hover:bg-emerald-900/40 border border-slate-800 hover:border-sky-500 p-3 rounded-xl text-sm text-left transition"
        >
          <Users className="w-4 h-4 text-sky-400 shrink-0" />
          <span>Ponte com CONECTAR</span>
        </button>
      </div>

      {speechStatus && (
        <div className="text-xs text-amber-300 bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-2 mb-2">
          {speechStatus}
        </div>
      )}

      <main className="flex-1 bg-slate-900/75 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-4 mb-4 max-h-[60vh]">
        {messages.map((msg, idx) => {
          const isModel = msg.role === 'model';
          const isSpeakingThis = speakingIdx === idx;
          return (
            <div
              key={idx}
              className={`flex ${isModel ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                  isModel
                    ? 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none'
                    : 'bg-emerald-700 text-white rounded-br-none'
                }`}
              >
                <div>{msg.text}</div>
                {isModel && (
                  <div className="mt-2 pt-2 border-t border-slate-700/70 flex justify-end">
                    <button
                      type="button"
                      onClick={() => (isSpeakingThis ? stopSpeaking() : speakText(msg.text, idx))}
                      className="inline-flex items-center gap-1 text-xs text-amber-300 hover:text-amber-200"
                    >
                      {isSpeakingThis ? (
                        <>
                          <Square className="w-3.5 h-3.5" /> Parar áudio
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" /> Ouvir resposta
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="text-xs text-amber-400 animate-pulse">
            {statusNote || 'NARA está organizando e gravando sua resposta...'}
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {attachment && (
        <div className="flex items-center justify-between bg-slate-800 border border-emerald-600/60 text-emerald-200 text-xs px-3 py-2 rounded-xl mb-2">
          <span>📎 Arquivo pronto para enviar: <strong>{attachment.name}</strong></span>
          <button
            type="button"
            onClick={() => setAttachment(null)}
            className="text-slate-400 hover:text-red-400 ml-2"
            title="Remover anexo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex gap-2 items-center"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.txt,.csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Importar PDF, texto ou foto"
          className="bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 p-3 rounded-xl transition shrink-0"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={toggleVoice}
          title={isListening ? 'Parar gravação de voz' : 'Falar no microfone'}
          className={`p-3 rounded-xl border transition shrink-0 ${
            isListening
              ? 'bg-red-600 border-red-500 text-white animate-pulse'
              : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-amber-300'
          }`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (!isListening) committedTextRef.current = e.target.value;
          }}
          placeholder={isListening ? 'Ouvindo sua voz...' : 'Escreva, fale ou anexe um PDF/foto para a NARA...'}
          className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 text-sm outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold px-5 py-3 rounded-xl flex items-center gap-2 transition shrink-0"
        >
          <Send className="w-4 h-4" /> Enviar
        </button>
      </form>
    </div>
  );
}
