import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Trash2, Lightbulb, Users, Compass } from 'lucide-react';

const SYSTEM_PROMPT = `Você é NARA, a Secretária Executiva Inteligente do ecossistema AMZTECH.
Sua filosofia: "QUEM PRECISA. QUEM TEM. NARA CONECTA."

Seu papel:
- Acolher pessoas com diferentes níveis de conhecimento tecnológico, com inteligência, empatia, clareza e objetividade.
- Atuar como secretária executiva, assistente de planejamento e ponte entre necessidades, conhecimentos, serviços e oportunidades.
- No DECIDA AÍ: respeitar que YKMS é a arara mentora permanente do jogo, enquanto você (NARA) entra na "Hora do Estalo" quando surge uma ideia relevante para estruturar o projeto, analisar viabilidade, recursos e necessidades, organizar possibilidades de execução e encaminhar ao CONECTAR quando precisar de pessoas, parceiros ou recursos.
- Na AMZTECH: coordenar, orientar, organizar e acompanhar, sempre deixando claro quando algo ainda está em fase concebida, prototipada ou funcional/testada.

Fluxo operacional de 9 etapas:
01. Escuta -> 02. Compreende -> 03. Pesquisa -> 04. Planeja -> 05. Valida -> 06. Executa -> 07. Verifica -> 08. Entrega -> 09. Acompanha.

Limites obrigatórios (nunca quebrar):
- Nunca inventar informações ou fatos.
- Nunca afirmar que realizou uma tarefa externa, financeira, contratual ou de publicação sem que isso tenha sido realmente feito e autorizado.
- Sempre pedir validação/autorização antes de ações externas, financeiras, contratuais ou irreversíveis.
- Nunca expor dados privados e não substituir especialistas humanos em decisões técnicas, médicas ou jurídicas.
- Responder sempre em português do Brasil, de forma acolhedora, organizada e com o próximo passo claro.`;

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
  const bottomRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('nara_amztech_chat', JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (customText) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || loading) return;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', text: textToSend },
        {
          role: 'model',
          text: '⚠️ Ainda falta cadastrar a chave VITE_GEMINI_API_KEY na Vercel ou Netlify e fazer um novo Deploy para eu conseguir responder.',
        },
      ]);
      setInput('');
      return;
    }

    const updatedMessages = [...messages, { role: 'user', text: textToSend }];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const contents = updatedMessages.map((m) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text }],
      }));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error?.message || 'Erro ao conectar com a API do Gemini.');
      }

      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        'Não recebi resposta agora. Podemos tentar novamente com calma.';

      setMessages((prev) => [...prev, { role: 'model', text: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: `❌ Encontrei um bloqueio na conexão: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    const initial = [
      {
        role: 'model',
        text: 'Conversa reiniciada com carinho. Qual demanda, ideia ou projeto vamos organizar agora?',
      },
    ];
    setMessages(initial);
    localStorage.setItem('nara_amztech_chat', JSON.stringify(initial));
  };

  return (
    <div className="min-h-screen flex flex-col max-w-4xl mx-auto p-4">
      <header className="flex items-center justify-between bg-emerald-950/90 border border-emerald-700/50 rounded-2xl p-4 mb-4 shadow-lg">
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
          onClick={clearHistory}
          title="Limpar conversa"
          className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-300 px-3 py-2 rounded-lg border border-slate-700 transition"
        >
          <Trash2 className="w-4 h-4" /> Nova conversa
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        <button
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

      <main className="flex-1 bg-slate-900/75 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-4 mb-4 max-h-[60vh]">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-700 text-white rounded-br-none'
                  : 'bg-slate-800 text-slate-100 border border-slate-700 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-xs text-amber-400 animate-pulse">
            NARA está ouvindo, organizando e preparando o próximo passo...
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escreva aqui sua ideia, dúvida ou pedido para a NARA..."
          className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 text-sm outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold px-5 py-3 rounded-xl flex items-center gap-2 transition"
        >
          <Send className="w-4 h-4" /> Enviar
        </button>
      </form>
    </div>
  );
}
