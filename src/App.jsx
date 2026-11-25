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
  Plus,
  MessageSquare,
  Sprout,
  GraduationCap,
  DollarSign,
  Briefcase,
  Menu,
  Globe,
} from 'lucide-react';

// ============================================================================
// 1. ARQUITETURA MODULAR DE CONTEXTOS E IDENTIDADES (NARA / AMZTECH / DECIDA AÍ)
// ============================================================================

const CORE_IDENTITY = `Você é NARA, a Secretária Executiva Inteligente do ecossistema AMZTECH.
Sua filosofia institucional: "QUEM PRECISA. QUEM TEM. NARA CONECTA."

Identidade e Postura:
- Acolher pessoas com diferentes níveis de conhecimento tecnológico, com inteligência, empatia, clareza, objetividade e linguagem acessível.
- Atuar como secretária executiva, assistente de planejamento, organizadora de conhecimento e ponte entre necessidades, conhecimentos, serviços e oportunidades.
- Fluxo operacional de 9 etapas: 01. Escuta -> 02. Compreende -> 03. Pesquisa -> 04. Planeja -> 05. Valida -> 06. Executa -> 07. Verifica -> 08. Entrega -> 09. Acompanha.
- Recurso de voz na tela: o site escreve suas respostas na tela, mantém o histórico salvo e possui leitura em voz alta em português do Brasil com o botão "Ouvir resposta". Nunca repita o que o usuário falou ou perguntou apenas para ecoar; vá direto para a resposta, orientação e próximo passo. Nunca diga que não consegue falar ou que opera apenas por texto.

Limites éticos obrigatórios (nunca quebrar):
- Nunca inventar informações, dados ou fatos. Se não houver informação confirmada, declare com transparência.
- Nunca afirmar que realizou uma tarefa externa, financeira, contratual ou de publicação sem que isso tenha sido realmente feito e autorizado.
- Sempre pedir validação/autorização antes de ações externas, financeiras, contratuais ou irreversíveis.
- Nunca expor dados privados e não substituir especialistas humanos em decisões técnicas, médicas ou jurídicas.
- Responder sempre em português do Brasil, de forma acolhedora, organizada e com o próximo passo claro.`;

const YKMS_BOUNDARY = `Fronteira Estrita com o YKMS (Projeto DECIDA AÍ):
- No DECIDA AÍ — Jogo da Estratégia da Vida, YKMS é a arara mentora permanente dos jogadores: é o YKMS quem interage com os jovens durante a experiência do jogo, provoca reflexões, incentiva decisões e conduz a virada de chave na "Hora do Estalo".
- Você (NARA) atua exclusivamente na coordenação executiva, bastidores, apoio a escolas e educadores, organização de missões/evolução e estruturação prática das ideias quando encaminhadas para execução ou conexão.
- NUNCA substitua a personalidade, a voz ou as funções próprias do YKMS e nunca fale como se fosse o YKMS.`;

const FOUNDER_LEARNING_CONTEXT = `Contexto Institucional e Pessoal da Fundadora (Márcia Abrantes):
- Márcia Abrantes é a fundadora e está em processo contínuo de aprendizagem e desenvolvimento para ampliar sua capacidade de gestão tecnológica e empresarial por meio de dois cursos em andamento:
  1. CURSO BRADESCO — "Agentes de IA do Zero à Prática": estudando Chatbots, Copilotos e Agentes, engenharia de prompts, modelos de linguagem, automação e construção prática de agentes.
  2. CURSO DIRECT OFFERS — "Como vender em dólar": estudando estratégias de ofertas e comercialização digital com perspectiva de mercado internacional.
- Seu papel ao apoiar Márcia nesses temas: ajudar a compreender os conceitos em linguagem clara, organizar os aprendizados, relacionar os conhecimentos com o ecossistema AMZTECH, identificar aplicações práticas e transformar estudos em oportunidades de melhoria nos projetos.
- TRAVA OBRIGATÓRIA DE VERACIDADE: NUNCA afirmar que Márcia já domina essas tecnologias ou que possui competência profissional comprovada/certificada nesses temas. Trate sempre com respeito e precisão como conhecimentos em estudo e construção prática.`;

const MODES = {
  livre: {
    id: 'livre',
    group: 'GERAL',
    label: 'Conversar & Pesquisar',
    shortDesc: 'Pesquisas gerais, atualidades e conversa livre',
    welcome:
      'Olá! Eu sou a NARA. Estou pronta para conversar, tirar dúvidas gerais ou pesquisar informações atualizadas para você. Como posso ajudar hoje?',
    systemInstruction: `${CORE_IDENTITY}

Modo Ativo: CONVERSA LIVRE & PESQUISA GERAL.
- Responda com naturalidade, clareza e precisão a qualquer pergunta geral, explicação, redação, planejamento ou pesquisa sobre atualidades (política, economia, cotidiano, tecnologia, etc.), utilizando a busca em tempo real quando disponível.
- Mantenha postura neutra, objetiva e fundamentada em fatos.`,
  },
  conectar: {
    id: 'conectar',
    group: 'ECOSSISTEMA AMZTECH',
    label: 'Conectar Pessoas',
    shortDesc: 'Quem precisa. Quem tem. NARA conecta.',
    welcome:
      'Bem-vindo à ponte de conexões da AMZTECH! Conte o que você precisa ou o que você tem a oferecer (serviço, conhecimento, parceria ou solução) para organizarmos o melhor caminho.',
    systemInstruction: `${CORE_IDENTITY}

Modo Ativo: PLATAFORMA AMZTECH — CONEXÃO E ATENDIMENTO.
- Público atendido: produtores rurais e pessoas do campo, empreendedores, pequenos negócios, empresas, prestadores de serviços, instituições públicas/privadas, investidores, parceiros e pessoas em busca de soluções.
- Sua tarefa: escutar a necessidade em linguagem simples, organizar os pontos principais (o que precisa, onde está, qual recurso ou apoio busca), pesquisar possibilidades e preparar o encaminhamento claro para conectar quem precisa com quem pode ajudar.
- Não exponha detalhes internos de estudos pessoais da fundadora neste atendimento.`,
  },
  produtor: {
    id: 'produtor',
    group: 'ECOSSISTEMA AMZTECH',
    label: 'Produtor & Negócios',
    shortDesc: 'Apoio simples para campo e pequenos negócios',
    welcome:
      'Olá! Aqui é a NARA da AMZTECH. Pode falar ou escrever do seu jeito sobre sua produção, propriedade ou negócio. Vamos organizar juntos passo a passo!',
    systemInstruction: `${CORE_IDENTITY}

Modo Ativo: APOIO AO PRODUTOR RURAL E PEQUENOS NEGÓCIOS (AMZTECH).
- Use linguagem muito simples, acolhedora, sem jargões técnicos difíceis, respeitando quem tem pouca familiaridade com leitura ou tecnologia.
- Organize informações de produção, vendas, organização financeira básica, dúvidas operacionais e busca por parceiros ou ferramentas, sempre em passos curtos e fáceis de ouvir em áudio.`,
  },
  decida_ai: {
    id: 'decida_ai',
    group: 'PROJETOS & JORNADA',
    label: 'DECIDA AÍ (Coordenação)',
    shortDesc: 'Bastidores, escolas, educadores e Hora do Estalo',
    welcome:
      'Espaço de coordenação do DECIDA AÍ ativo! Posso ajudar a organizar missões, apoiar educadores e escolas, acompanhar a evolução dos projetos ou estruturar ideias vindas da Hora do Estalo.',
    systemInstruction: `${CORE_IDENTITY}

${YKMS_BOUNDARY}

Modo Ativo: PROJETO DECIDA AÍ — COORDENAÇÃO E ESTRUTURAÇÃO.
- Apoie educadores, escolas, gestores e a estruturação prática de ideias que surgem após a "Hora do Estalo" (analisando viabilidade, recursos necessários e próximos passos).
- Preserve integralmente o papel do YKMS como mentor direto dos jovens no jogo.`,
  },
  estudo_ia: {
    id: 'estudo_ia',
    group: 'ESPAÇO DA FUNDADORA',
    label: 'Curso: Agentes de IA',
    shortDesc: 'Bradesco — Agentes de IA do Zero à Prática',
    welcome:
      'Espaço de estudos ativo (Curso Bradesco — Agentes de IA do Zero à Prática)! Pode trazer sua aula, anotação, prompt ou dúvida sobre chatbots, copilotos, agentes ou automação para organizarmos e aplicarmos na AMZTECH.',
    systemInstruction: `${CORE_IDENTITY}

${FOUNDER_LEARNING_CONTEXT}

Modo Ativo: ACOMPANHAMENTO DE ESTUDOS — CURSO BRADESCO (AGENTES DE IA DO ZERO À PRÁTICA).
- Ajude Márcia a destrinchar conceitos de chatbots, copilotos, agentes autônomos, engenharia de prompts, modelos de linguagem e automação sem complicação.
- Sempre conecte o aprendizado com ideias práticas de melhoria para a própria NARA e para o ecossistema AMZTECH, respeitando a trava de que ela está em fase de estudo e prática.`,
  },
  estudo_ofertas: {
    id: 'estudo_ofertas',
    group: 'ESPAÇO DA FUNDADORA',
    label: 'Curso: Vender em Dólar',
    shortDesc: 'Direct Offers — Ofertas e mercado internacional',
    welcome:
      'Espaço de estudos ativo (Curso Direct Offers — Como vender em dólar)! Traga os conceitos, modelos de oferta ou ideias de produtos digitais para estruturarmos e avaliarmos oportunidades para o ecossistema.',
    systemInstruction: `${CORE_IDENTITY}

${FOUNDER_LEARNING_CONTEXT}

Modo Ativo: ACOMPANHAMENTO DE ESTUDOS — CURSO DIRECT OFFERS (COMO VENDER EM DÓLAR).
- Ajude Márcia a compreender estruturas de ofertas diretas, posicionamento, propostas de valor e comercialização digital com visão internacional.
- Relacione os aprendizados com possíveis produtos, conteúdos ou soluções da AMZTECH, mantendo sempre a transparência de que são estudos em andamento.`,
  },
  executivo: {
    id: 'executivo',
    group: 'ESPAÇO DA FUNDADORA',
    label: 'Planejamento Executivo',
    shortDesc: 'Documentos, propostas, estratégias e gestão',
    welcome:
      'Modo Executivo ativo, Márcia! Vamos estruturar seus planos, propostas, apresentações, documentos ou decisões estratégicas da AMZTECH. Qual é a prioridade agora?',
    systemInstruction: `${CORE_IDENTITY}

${YKMS_BOUNDARY}

${FOUNDER_LEARNING_CONTEXT}

Modo Ativo: APOIO EXECUTIVO À FUNDADORA (MÁRCIA ABRANTES).
- Atue como braço direito executivo para planejamento, elaboração de documentos, propostas, apresentações, organização de projetos e tomada de decisão estratégica no ecossistema AMZTECH.`,
  },
};

const PREFERRED_MODELS = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-flash-lite-latest'];
const STORAGE_KEY = 'nara_amztech_sessions_v2';

const cleanTextForSpeech = (rawText = '') => {
  return rawText
    .replace(/```[\s\S]*?```/g, ' bloco de código ')
    .replace(/[*#_`~>]+/g, ' ')
    .replace(/[📎⚠️❌✨🌐]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const createNewSession = (modeId = 'livre') => {
  const mode = MODES[modeId] || MODES.livre;
  return {
    id: `sess_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    title: mode.label,
    modeId: mode.id,
    updatedAt: new Date().toISOString(),
    messages: [{ role: 'model', text: mode.welcome }],
  };
};

export default function App() {
  const [sessions, setSessions] = useState(() => {
    try {
      const savedV2 = localStorage.getItem(STORAGE_KEY);
      if (savedV2) {
        const parsed = JSON.parse(savedV2);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // Migra histórico antigo se existir
      const oldChat = localStorage.getItem('nara_amztech_chat');
      if (oldChat) {
        const oldMessages = JSON.parse(oldChat);
        if (Array.isArray(oldMessages) && oldMessages.length > 0) {
          return [
            {
              id: 'sess_migrated',
              title: 'Conversa Anterior',
              modeId: 'livre',
              updatedAt: new Date().toISOString(),
              messages: oldMessages,
            },
          ];
        }
      }
    } catch {
      // ignora erro de leitura
    }
    return [createNewSession('livre')];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => sessions[0]?.id);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) || sessions[0] || createNewSession('livre');
  const activeMode = MODES[activeSession.modeId] || MODES.livre;
  const messages = activeSession.messages || [];

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch {
      // ignora limite de armazenamento se anexo grande
    }
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessions, activeSessionId]);

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

  const startSessionWithMode = (modeId) => {
    stopSpeaking();
    const fresh = createNewSession(modeId);
    setSessions((prev) => [fresh, ...prev]);
    setActiveSessionId(fresh.id);
    setInput('');
    setAttachment(null);
    setSidebarOpen(false);
  };

  const deleteSession = (e, sessionId) => {
    e.stopPropagation();
    stopSpeaking();
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== sessionId);
      if (remaining.length === 0) {
        const fallback = createNewSession('livre');
        setActiveSessionId(fallback.id);
        return [fallback];
      }
      if (sessionId === activeSession.id) {
        setActiveSessionId(remaining[0].id);
      }
      return remaining;
    });
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

    recognition.onstart = () => setIsListening(true);

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

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

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

  const callGeminiWithSearchFallback = async (apiKey, systemInstruction, contents) => {
    let lastError = 'Erro ao conectar com a API do Gemini.';

    for (const modelName of PREFERRED_MODELS) {
      // Tenta primeiro com Google Search Grounding (atualidades e pesquisas), e se o modelo/chave não aceitar tools, faz fallback limpo sem tools
      const attempts = [true, false];

      for (const useSearch of attempts) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 14000);

        try {
          setStatusNote(
            useSearch ? `Pesquisando e respondendo (${modelName})...` : `Respondendo (${modelName})...`
          );

          const bodyPayload = {
            systemInstruction: { parts: [{ text: systemInstruction }] },
            contents,
          };
          if (useSearch) {
            bodyPayload.tools = [{ googleSearch: {} }];
          }

          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify(bodyPayload),
            }
          );
          clearTimeout(timeoutId);
          const data = await response.json();

          if (response.ok) {
            const parts = data?.candidates?.[0]?.content?.parts || [];
            const reply =
              parts
                .map((p) => p.text)
                .filter(Boolean)
                .join('\n') || 'Não recebi resposta agora. Podemos tentar novamente com calma.';
            return { ok: true, reply };
          }

          lastError = data?.error?.message || lastError;
          // Se não for erro de suporte a tools/search, não precisa repetir sem search no mesmo modelo
          if (!useSearch || (!lastError.toLowerCase().includes('search') && !lastError.toLowerCase().includes('tool'))) {
            break;
          }
        } catch (err) {
          clearTimeout(timeoutId);
          lastError =
            err.name === 'AbortError'
              ? 'A conexão demorou mais do que o esperado.'
              : err.message || lastError;
          break;
        }
      }
    }

    return { ok: false, error: lastError };
  };

  const updateSessionMessages = (targetId, updaterFn, possibleTitle = null) => {
    setSessions((prev) =>
      prev.map((sess) => {
        if (sess.id !== targetId) return sess;
        const nextMessages = updaterFn(sess.messages);
        const shouldRename =
          possibleTitle &&
          sess.messages.length <= 1 &&
          sess.title === (MODES[sess.modeId]?.label || sess.title);
        return {
          ...sess,
          title: shouldRename
            ? possibleTitle.slice(0, 34) + (possibleTitle.length > 34 ? '...' : '')
            : sess.title,
          updatedAt: new Date().toISOString(),
          messages: nextMessages,
        };
      })
    );
  };

  const sendMessage = async (customText) => {
    const textToSend = (customText || input).trim();
    if ((!textToSend && !attachment) || loading) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    stopSpeaking();

    const targetSessionId = activeSession.id;
    const currentSystemInstruction = activeMode.systemInstruction;

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      updateSessionMessages(targetSessionId, (prev) => [
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

    updateSessionMessages(
      targetSessionId,
      () => updatedMessages,
      textToSend || currentAttachment?.name
    );

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

      const result = await callGeminiWithSearchFallback(
        apiKey,
        currentSystemInstruction,
        recentHistory
      );

      if (result.ok) {
        updateSessionMessages(targetSessionId, (prev) => [
          ...prev,
          { role: 'model', text: result.reply },
        ]);
        speakText(result.reply, nextModelIndex);
      } else {
        updateSessionMessages(targetSessionId, (prev) => [
          ...prev,
          { role: 'model', text: `❌ Encontrei um bloqueio na conexão: ${result.error}` },
        ]);
      }
    } finally {
      setLoading(false);
      setStatusNote('');
    }
  };

  const getModeIcon = (modeId) => {
    switch (modeId) {
      case 'livre':
        return <Globe className="w-4 h-4 text-sky-400 shrink-0" />;
      case 'conectar':
        return <Users className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'produtor':
        return <Sprout className="w-4 h-4 text-lime-400 shrink-0" />;
      case 'decida_ai':
        return <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'estudo_ia':
        return <GraduationCap className="w-4 h-4 text-purple-400 shrink-0" />;
      case 'estudo_ofertas':
        return <DollarSign className="w-4 h-4 text-amber-300 shrink-0" />;
      case 'executivo':
        return <Briefcase className="w-4 h-4 text-teal-400 shrink-0" />;
      default:
        return <Compass className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
  };

  const menuGroups = [
    {
      title: 'ECOSSISTEMA AMZTECH',
      items: [MODES.conectar, MODES.produtor],
    },
    {
      title: 'PROJETOS & JORNADA',
      items: [MODES.decida_ai],
    },
    {
      title: 'ESPAÇO DA FUNDADORA',
      items: [MODES.estudo_ia, MODES.estudo_ofertas, MODES.executivo],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Overlay mobile para fechar menu */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
        />
      )}

      {/* MENU LATERAL ORGANIZADO POR FINALIDADE */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Identidade no topo do menu */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 via-amber-400 to-sky-500 flex items-center justify-center font-bold text-slate-950 text-base shadow">
              N
            </div>
            <div>
              <div className="font-bold text-amber-400 text-base leading-tight flex items-center gap-1.5">
                NARA <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-[11px] text-emerald-300">AMZTECH • Inteligência que conecta</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1"
            title="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Botão Nova Conversa (Modo Livre & Pesquisa) */}
        <div className="p-3">
          <button
            type="button"
            onClick={() => startSessionWithMode('livre')}
            className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-medium text-sm py-2.5 px-3 rounded-xl shadow transition"
          >
            <Plus className="w-4 h-4" /> Nova conversa (Livre)
          </button>
        </div>

        {/* Grupos por Finalidade + Histórico */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
          {menuGroups.map((group) => (
            <div key={group.title}>
              <div className="text-[10px] font-semibold tracking-wider text-amber-400/90 px-2 mb-1.5">
                {group.title}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isCurrentMode = activeMode.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => startSessionWithMode(item.id)}
                      className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-left transition ${
                        isCurrentMode
                          ? 'bg-slate-800 border border-emerald-600/60 text-white'
                          : 'hover:bg-slate-800/70 text-slate-300'
                      }`}
                    >
                      <div className="mt-0.5">{getModeIcon(item.id)}</div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate">{item.label}</div>
                        <div className="text-[10px] text-slate-400 truncate">{item.shortDesc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Histórico de Conversas Salvas */}
          <div>
            <div className="text-[10px] font-semibold tracking-wider text-amber-400/90 px-2 mb-1.5">
              MINHA AMZTECH • HISTÓRICO
            </div>
            <div className="space-y-1">
              {sessions.map((sess) => {
                const isSelected = sess.id === activeSession.id;
                return (
                  <div
                    key={sess.id}
                    onClick={() => {
                      stopSpeaking();
                      setActiveSessionId(sess.id);
                      setSidebarOpen(false);
                    }}
                    className={`group flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs cursor-pointer transition ${
                      isSelected
                        ? 'bg-emerald-950/90 border border-emerald-700/60 text-emerald-200'
                        : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                      <span className="truncate">{sess.title}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => deleteSession(e, sess.id)}
                      title="Apagar esta conversa"
                      className="opacity-70 hover:opacity-100 text-slate-500 hover:text-red-400 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL DE CONVERSA */}
      <div className="flex-1 flex flex-col min-w-0 max-w-4xl mx-auto w-full p-3 sm:p-4">
        {/* Cabeçalho da Área Ativa */}
        <header className="flex items-center justify-between bg-emerald-950/90 border border-emerald-700/50 rounded-2xl px-4 py-3 mb-3 shadow-lg gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden bg-slate-800 hover:bg-slate-700 text-amber-300 p-2 rounded-xl border border-slate-700"
              title="Abrir menu de finalidades"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {getModeIcon(activeMode.id)}
                <h1 className="text-sm sm:text-base font-bold text-amber-400 truncate">
                  {activeMode.label}
                </h1>
              </div>
              <p className="text-[11px] text-emerald-200 truncate">
                Quem precisa. Quem tem. NARA conecta. • {activeMode.shortDesc}
              </p>
            </div>
          </div>

          <span className="text-[11px] font-semibold bg-emerald-900/90 text-emerald-300 border border-emerald-600/50 px-2.5 py-1 rounded-full shrink-0">
            ONLINE
          </span>
        </header>

        {speechStatus && (
          <div className="text-xs text-amber-300 bg-slate-900 border border-amber-500/40 rounded-xl px-3 py-2 mb-2">
            {speechStatus}
          </div>
        )}

        {/* Balões de Mensagem */}
        <main className="flex-1 bg-slate-900/75 border border-slate-800 rounded-2xl p-4 overflow-y-auto space-y-4 mb-3 max-h-[65vh]">
          {messages.map((msg, idx) => {
            const isModel = msg.role === 'model';
            const isSpeakingThis = speakingIdx === idx;
            return (
              <div key={idx} className={`flex ${isModel ? 'justify-start' : 'justify-end'}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
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
            <span>
              📎 Arquivo pronto para enviar: <strong>{attachment.name}</strong>
            </span>
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

        {/* Barra de Entrada (Anexo + Microfone + Texto + Enviar) */}
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
            placeholder={
              isListening
                ? 'Ouvindo sua voz...'
                : 'Digite sua necessidade, fale no microfone ou anexe PDF/foto...'
            }
            className="flex-1 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 text-sm outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-semibold px-4 sm:px-5 py-3 rounded-xl flex items-center gap-2 transition shrink-0"
          >
            <Send className="w-4 h-4" /> <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
}
